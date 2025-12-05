import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { enviarParaMake } from '../services/makeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuração do Multer
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel 
  ? '/tmp/uploads'
  : path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel'];
    const allowedExts = ['.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'));
    }
  }
});

// Validação de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função auxiliar para processar leads
async function processarLeads(leads, filename, userId) {
  // Validar colunas obrigatórias
  const requiredColumns = ['nome', 'email'];
  const firstRecord = leads[0];
  
  if (!firstRecord) {
    throw new Error('Nenhum lead encontrado');
  }

  const missingColumns = requiredColumns.filter(col => !(col in firstRecord));
  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
  }

  // Validar e processar leads
  const leadsValidos = [];
  const leadsInvalidos = [];

  for (const record of leads) {
    const { nome, email, empresa } = record;

    if (!nome || !email) {
      leadsInvalidos.push({ nome: nome || 'N/A', email: email || 'N/A', motivo: 'Nome ou email vazio' });
      continue;
    }

    if (!isValidEmail(email)) {
      leadsInvalidos.push({ nome, email, motivo: 'Email inválido' });
      continue;
    }

    leadsValidos.push({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      empresa: empresa ? empresa.trim() : null
    });
  }

  // Limite de 200 leads
  if (leadsValidos.length > 200) {
    throw new Error(`Limite de 200 leads excedido. Encontrados: ${leadsValidos.length}`);
  }

  if (leadsValidos.length === 0) {
    throw new Error('Nenhum lead válido encontrado');
  }

  // Gerar batchId único
  const batchId = uuidv4();
  console.log('🆔 Batch ID gerado:', batchId);
  console.log('👤 User ID:', userId);

  // Inserir batch no Supabase
  const { data: batch, error: batchError } = await supabaseAdmin
    .from('batches')
    .insert({
      id: batchId,
      user_id: userId,
      filename: filename,
      total_leads: leadsValidos.length,
      status: 'processing'
    })
    .select()
    .single();

  if (batchError) {
    console.error('❌ Erro ao inserir batch:', batchError);
    throw new Error(`Erro ao criar batch: ${batchError.message}`);
  }

  console.log('✅ Batch criado:', batch);

  // Inserir leads no Supabase
  const leadsToInsert = leadsValidos.map(lead => ({
    batch_id: batchId,
    nome: lead.nome,
    email: lead.email,
    empresa: lead.empresa,
    status: 'pending'
  }));

  const { error: leadsError } = await supabaseAdmin
    .from('leads')
    .insert(leadsToInsert);

  if (leadsError) {
    console.error('❌ Erro ao inserir leads:', leadsError);
    throw new Error(`Erro ao inserir leads: ${leadsError.message}`);
  }

  console.log('✅ Leads inseridos:', leadsValidos.length);

  // Enviar para Make.com
  const backendUrl = process.env.BACKEND_URL || 'https://disparodeemails-leads-backend.vercel.app';
  const callbackUrl = `${backendUrl}/api/webhook/resultado`;
  
  console.log('🚀 Preparando envio para Make.com...');
  console.log('   Callback URL:', callbackUrl);
  
  enviarParaMake(batchId, leadsValidos, callbackUrl)
    .then(result => {
      if (!result.success) {
        console.error('❌ Erro ao enviar para Make.com:', result.error);
        supabaseAdmin
          .from('batches')
          .update({ status: 'error' })
          .eq('id', batchId)
          .then(() => console.log('Batch atualizado para erro'));
      } else {
        console.log('✅ Envio para Make.com iniciado com sucesso');
      }
    })
    .catch(error => {
      console.error('❌ Erro ao enviar para Make.com:', error);
      supabaseAdmin
        .from('batches')
        .update({ status: 'error' })
        .eq('id', batchId)
        .then(() => console.log('Batch atualizado para erro'));
    });

  return {
    batchId,
    totalLeads: leadsValidos.length,
    leadsInvalidos: leadsInvalidos.length,
    message: `Upload realizado com sucesso. ${leadsValidos.length} leads válidos processados.`
  };
}

// POST /api/upload (CSV via arquivo) - Requer autenticação
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    filePath = req.file.path;
    console.log('📄 Arquivo recebido:', req.file.originalname);

    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const result = await processarLeads(records, req.file.originalname, req.user.id);

    // Remover arquivo após processar
    await fs.unlink(filePath).catch(console.error);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error.message);
    
    if (filePath) {
      await fs.unlink(filePath).catch(console.error);
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/upload/json - Requer autenticação
router.post('/json', requireAuth, async (req, res) => {
  try {
    let leads = req.body;
    
    // Aceitar tanto array direto quanto objeto com propriedade "leads"
    if (leads && typeof leads === 'object' && !Array.isArray(leads)) {
      if (leads.leads && Array.isArray(leads.leads)) {
        leads = leads.leads;
      }
    }

    if (!Array.isArray(leads)) {
      return res.status(400).json({
        success: false,
        message: 'Formato inválido. Envie um array de leads ou um objeto com propriedade "leads".'
      });
    }

    console.log('📨 JSON recebido com', leads.length, 'leads');

    const result = await processarLeads(leads, 'json-upload', req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Erro no upload JSON:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/upload/status/:batchId - Requer autenticação
router.get('/status/:batchId', requireAuth, async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user.id;

    // Buscar batch que pertence ao usuário
    const { data: batch, error } = await supabaseAdmin
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();

    if (error || !batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch não encontrado ou não autorizado'
      });
    }

    res.json({
      id: batch.id,
      filename: batch.filename,
      totalLeads: batch.total_leads,
      status: batch.status,
      sucessos: batch.sucessos,
      erros: batch.erros || [],
      createdAt: batch.created_at,
      updatedAt: batch.updated_at
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status do batch'
    });
  }
});

// GET /api/upload/history - Requer autenticação
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const { data: batches, error } = await supabaseAdmin
      .from('batches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    res.json(batches.map(batch => ({
      id: batch.id,
      filename: batch.filename,
      totalLeads: batch.total_leads,
      status: batch.status,
      sucessos: batch.sucessos,
      erros: Array.isArray(batch.erros) ? batch.erros.length : 0,
      createdAt: batch.created_at
    })));
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico'
    });
  }
});

export default router;

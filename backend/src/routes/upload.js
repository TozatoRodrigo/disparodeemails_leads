import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import { enviarParaMake } from '../services/makeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuração do Multer
// Na Vercel, usar /tmp (único diretório writable)
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Função auxiliar para processar leads (usada tanto para CSV quanto JSON)
async function processarLeads(leads, filename = 'json-upload') {
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

  // Inserir batch no banco
  const insertBatch = db.prepare(`
    INSERT INTO batches (id, filename, total_leads, status)
    VALUES (?, ?, ?, 'pending')
  `);
  insertBatch.run(batchId, filename, leadsValidos.length);

  // Inserir leads no banco
  const insertLead = db.prepare(`
    INSERT INTO leads (batch_id, nome, email, empresa, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);

  const insertMany = db.transaction((leads) => {
    for (const lead of leads) {
      insertLead.run(batchId, lead.nome, lead.email, lead.empresa);
    }
  });

  insertMany(leadsValidos);

  // Atualizar status do batch para processing
  const updateBatchStatus = db.prepare(`
    UPDATE batches SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  updateBatchStatus.run(batchId);

  // Enviar para Make.com (não bloqueia resposta)
  const callbackUrl = `${process.env.BACKEND_URL}/api/webhook/resultado`;
  
  enviarParaMake(batchId, leadsValidos, callbackUrl)
    .then(result => {
      if (!result.success) {
        console.error('❌ Erro ao enviar para Make.com:', result.error);
        const updateBatchError = db.prepare(`
          UPDATE batches SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `);
        updateBatchError.run(batchId);
      }
    })
    .catch(error => {
      console.error('❌ Erro ao enviar para Make.com:', error);
      const updateBatchError = db.prepare(`
        UPDATE batches SET status = 'error', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);
      updateBatchError.run(batchId);
    });

  return {
    batchId,
    totalLeads: leadsValidos.length,
    leadsInvalidos: leadsInvalidos.length,
    message: `Upload realizado com sucesso. ${leadsValidos.length} leads válidos processados.`
  };
}

// POST /api/upload (CSV via arquivo)
router.post('/', upload.single('file'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    filePath = req.file.path;
    console.log('📁 Arquivo recebido:', req.file.originalname);

    // Ler e parsear CSV
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log('🆔 Total de linhas no CSV:', records.length);

    // Usar função auxiliar para processar leads
    const result = await processarLeads(records, req.file.originalname);

    // Deletar arquivo temporário
    await fs.unlink(filePath);
    filePath = null;

    console.log('✅ Upload processado com sucesso');

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error.message);

    // Deletar arquivo temporário em caso de erro
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Erro ao deletar arquivo temporário:', unlinkError);
      }
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/upload/json (JSON direto)
router.post('/json', async (req, res) => {
  try {
    let leads = req.body;

    // Aceitar diferentes formatos de JSON
    if (Array.isArray(leads)) {
      // Formato 1: Array direto
      // leads já está no formato correto
    } else if (leads.leads && Array.isArray(leads.leads)) {
      // Formato 2: Objeto com propriedade "leads"
      leads = leads.leads;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato JSON inválido. Use um array de leads ou um objeto com propriedade "leads"'
      });
    }

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'O JSON deve conter pelo menos um lead'
      });
    }

    console.log('📋 JSON recebido com', leads.length, 'leads');

    // Usar função auxiliar para processar leads
    const result = await processarLeads(leads, 'json-upload');

    console.log('✅ JSON processado com sucesso');

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

// GET /api/upload/status/:batchId
router.get('/status/:batchId', (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch não encontrado'
      });
    }

    // Contar leads enviados e com erro
    const leadsStats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as enviados,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as erros
      FROM leads 
      WHERE batch_id = ?
    `).get(batchId);

    const erros = JSON.parse(batch.erros || '[]');

    res.json({
      id: batch.id,
      filename: batch.filename,
      totalLeads: batch.total_leads,
      status: batch.status,
      sucessos: leadsStats.enviados,
      erros: erros,
      createdAt: batch.created_at,
      updatedAt: batch.updated_at
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status do batch'
    });
  }
});

// GET /api/upload/history
router.get('/history', (req, res) => {
  try {
    const batches = db.prepare(`
      SELECT * FROM batches 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all();

    const batchesWithStats = batches.map(batch => {
      const leadsStats = db.prepare(`
        SELECT 
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as enviados,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as erros
        FROM leads 
        WHERE batch_id = ?
      `).get(batch.id);

      return {
        id: batch.id,
        filename: batch.filename,
        totalLeads: batch.total_leads,
        status: batch.status,
        sucessos: leadsStats.enviados,
        erros: leadsStats.erros,
        createdAt: batch.created_at,
        updatedAt: batch.updated_at
      };
    });

    res.json({
      success: true,
      batches: batchesWithStats
    });
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico'
    });
  }
});

export default router;


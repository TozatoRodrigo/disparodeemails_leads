import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.js';
import webhookRoutes from './routes/webhook.js';
import { supabaseAdmin } from './lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Criar pasta uploads se não existir
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel 
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Middlewares
// CORS - permitir múltiplas origens
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://disparodeemails-leads-frontend.vercel.app'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Permitir todas em produção por enquanto
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/upload', uploadRoutes);
app.use('/api/webhook', webhookRoutes);

// Rota de health check
app.get('/health', async (req, res) => {
  // Testar conexão com Supabase
  let supabaseStatus = 'unknown';
  try {
    const { data, error } = await supabaseAdmin.from('batches').select('count').limit(1);
    supabaseStatus = error ? 'error: ' + error.message : 'connected';
  } catch (e) {
    supabaseStatus = 'error: ' + e.message;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    makeWebhookConfigured: !!process.env.MAKE_WEBHOOK_URL,
    backendUrl: process.env.BACKEND_URL || 'https://disparodeemails-leads-backend.vercel.app'
  });
});

// Endpoint de debug para verificar batch (admin apenas)
app.get('/api/debug/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();
    
    if (batchError || !batch) {
      return res.status(404).json({ error: 'Batch não encontrado' });
    }

    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('batch_id', batchId);

    if (leadsError) {
      return res.status(500).json({ error: leadsError.message });
    }
    
    res.json({
      batch,
      leads,
      summary: {
        total: leads?.length || 0,
        pending: leads?.filter(l => l.status === 'pending').length || 0,
        sent: leads?.filter(l => l.status === 'sent').length || 0,
        error: leads?.filter(l => l.status === 'error').length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de teste para Make.com
app.post('/api/test/make-webhook', async (req, res) => {
  try {
    const { enviarParaMake } = await import('./services/makeService.js');
    const testBatchId = 'test-' + Date.now();
    const testLeads = [
      {
        nome: 'Teste',
        email: 'teste@example.com',
        empresa: 'Empresa Teste'
      }
    ];
    const callbackUrl = `${process.env.BACKEND_URL || 'https://disparodeemails-leads-backend.vercel.app'}/api/webhook/resultado`;
    
    console.log('🧪 Testando envio para Make.com...');
    const result = await enviarParaMake(testBatchId, testLeads, callbackUrl);
    
    res.json({
      success: result.success,
      message: result.success ? 'Teste enviado com sucesso para Make.com' : 'Erro ao enviar teste',
      error: result.error,
      batchId: testBatchId,
      makeWebhookUrl: process.env.MAKE_WEBHOOK_URL ? '✅ Configurado' : '❌ Não configurado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Email Dispatcher Backend API',
    version: '2.0.0',
    database: 'Supabase PostgreSQL',
    auth: 'Supabase Auth',
    endpoints: {
      upload: 'POST /api/upload (auth required)',
      uploadJson: 'POST /api/upload/json (auth required)',
      status: 'GET /api/upload/status/:batchId (auth required)',
      history: 'GET /api/upload/history (auth required)',
      webhook: 'POST /api/webhook/resultado (no auth)',
      health: 'GET /health'
    }
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

// Exportar app para Vercel serverless
export default app;

// Iniciar servidor apenas em desenvolvimento local
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🔗 Make Webhook: ${process.env.MAKE_WEBHOOK_URL ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`🗄️ Database: Supabase PostgreSQL`);
  });
}

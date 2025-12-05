import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.js';
import webhookRoutes from './routes/webhook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Criar pasta uploads se não existir
// Na Vercel, usar /tmp (único diretório writable)
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel 
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Middlewares
// CORS - permitir múltiplas origens em produção
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'https://disparodeemails-leads-frontend.vercel.app']
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todas em produção por enquanto
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
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    makeWebhookConfigured: !!process.env.MAKE_WEBHOOK_URL,
    backendUrl: process.env.BACKEND_URL || 'https://disparodeemails-leads-backend.vercel.app'
  });
});

// Rota de teste para Make.com (apenas para debug)
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
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/upload',
      status: 'GET /api/upload/status/:batchId',
      history: 'GET /api/upload/history',
      webhook: 'POST /api/webhook/resultado',
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
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔗 Make Webhook: ${process.env.MAKE_WEBHOOK_URL || 'Não configurado'}`);
  });
}


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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
    timestamp: new Date().toISOString()
  });
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


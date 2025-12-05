// Handler para Vercel Serverless Functions
// Este arquivo é o entry point para as serverless functions da Vercel
import app from '../src/index.js';

// Exportar o app Express para a Vercel
// A Vercel vai rotear todas as requisições para este handler
export default app;

# 📧 Email Dispatcher - Backend

Backend Node.js/Express para sistema de disparo de e-mails via Make.com.

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

Copie `.env.example` para `.env` e configure:

```env
PORT=3001
MAKE_WEBHOOK_URL=https://hook.us2.make.com/seu-webhook
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

## 🏃 Desenvolvimento

```bash
npm run dev
```

## 📦 Produção

```bash
npm start
```

## 🌐 Deploy na Vercel

O backend está configurado para funcionar como serverless function na Vercel.

**Configurações importantes:**
- Banco de dados SQLite usa `/tmp` na Vercel
- Uploads temporários em `/tmp/uploads`
- Handler em `api/index.js`

Veja [DEPLOY.md](../DEPLOY.md) para instruções completas.

## 📡 Endpoints

- `POST /api/upload` - Upload de CSV
- `GET /api/upload/status/:batchId` - Status do batch
- `GET /api/upload/history` - Histórico
- `POST /api/webhook/resultado` - Callback do Make.com
- `GET /health` - Health check

## 🔗 Integração Make.com

Veja [MAKE_WEBHOOK_SETUP.md](./MAKE_WEBHOOK_SETUP.md) para configuração completa.

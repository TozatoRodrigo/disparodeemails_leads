# 📧 Email Dispatcher

Sistema completo de disparo de e-mails via Make.com com interface web moderna.

## 🚀 Stack Tecnológica

### Backend
- **Node.js** + **Express**
- **SQLite** (better-sqlite3)
- **Multer** (upload de arquivos)
- **CSV Parse** (processamento de CSV)

### Frontend
- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **Lucide React** (ícones)

## 📁 Estrutura do Projeto

```
email-dispatcher/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── index.js
│   │   ├── database/
│   │   ├── routes/
│   │   └── services/
│   ├── uploads/
│   └── package.json
│
├── frontend/            # Interface React
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

## 🚀 Instalação Local

### Pré-requisitos
- Node.js >= 18
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas configurações
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_URL apontando para o backend
npm run dev
```

## 🌐 Deploy na Vercel

### ✅ Projetos em Produção

- **Backend**: https://disparodeemails-leads-backend.vercel.app
- **Frontend**: https://disparodeemails-leads-frontend.vercel.app

### Configuração Automática

O projeto está configurado para deploy automático na Vercel:

- ✅ **Backend**: Deploy como função serverless
- ✅ **Frontend**: Deploy como site estático
- ✅ **Deploy automático** a cada push para `main`

### Variáveis de Ambiente (Produção)

**Backend:**
- `MAKE_WEBHOOK_URL` - URL do webhook do Make.com
- `BACKEND_URL` - https://disparodeemails-leads-backend.vercel.app
- `FRONTEND_URL` - https://disparodeemails-leads-frontend.vercel.app

**Frontend:**
- `VITE_API_URL` - https://disparodeemails-leads-backend.vercel.app

## 📋 Variáveis de Ambiente

### Backend (.env)

```env
PORT=3001
MAKE_WEBHOOK_URL=https://hook.us2.make.com/seu-webhook
BACKEND_URL=https://seu-backend.vercel.app
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://seu-backend.vercel.app
```

## 🔧 Scripts Disponíveis

### Backend
- `npm run dev` - Desenvolvimento com watch
- `npm start` - Produção
- `npm run test:config` - Testar configuração

### Frontend
- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## 📡 Endpoints da API

- `POST /api/upload` - Upload de CSV
- `GET /api/upload/status/:batchId` - Status do batch
- `GET /api/upload/history` - Histórico de batches
- `POST /api/webhook/resultado` - Callback do Make.com
- `GET /health` - Health check

## 🔗 Integração Make.com

Veja o guia completo em: [backend/MAKE_WEBHOOK_SETUP.md](./backend/MAKE_WEBHOOK_SETUP.md)

## 📝 Licença

MIT

## 👤 Autor

TozatoRodrigo


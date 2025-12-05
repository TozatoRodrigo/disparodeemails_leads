# 📁 Estrutura do Projeto

## Organização

```
email-dispatcher/
├── backend/                    # Backend Node.js/Express
│   ├── api/                   # Handler para Vercel
│   │   └── index.js
│   ├── src/                   # Código fonte
│   │   ├── database/
│   │   │   └── db.js         # SQLite config
│   │   ├── routes/
│   │   │   ├── upload.js      # Rotas de upload
│   │   │   └── webhook.js     # Rotas de webhook
│   │   ├── services/
│   │   │   └── makeService.js # Serviço Make.com
│   │   └── index.js           # Servidor Express
│   ├── uploads/               # Arquivos temporários
│   ├── .env.example           # Exemplo de variáveis
│   ├── .gitignore
│   ├── package.json
│   ├── vercel.json            # Config Vercel
│   └── README.md
│
├── frontend/                  # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── UploadCSV.tsx
│   │   │   ├── PasteJSON.tsx
│   │   │   ├── BatchStatus.tsx
│   │   │   └── History.tsx
│   │   ├── App.tsx            # App principal
│   │   ├── main.tsx           # Entry point
│   │   ├── types.ts           # TypeScript types
│   │   └── index.css          # Estilos globais
│   ├── public/                # Assets estáticos
│   ├── .env.example           # Exemplo de variáveis
│   ├── .gitignore
│   ├── package.json
│   ├── vercel.json            # Config Vercel
│   ├── vite.config.ts         # Config Vite
│   ├── tailwind.config.js     # Config Tailwind
│   └── README.md
│
├── .github/                   # GitHub Actions
│   ├── workflows/
│   │   ├── ci.yml            # CI/CD
│   │   └── deploy.yml        # Deploy automático
│   └── dependabot.yml         # Atualizações automáticas
│
├── .gitignore                 # Git ignore global
├── .gitattributes             # Config Git
├── package.json               # Package.json raiz
├── README.md                  # README principal
├── DEPLOY.md                  # Guia de deploy
├── GIT_SETUP.md              # Guia Git/GitHub
└── QUICK_START.md            # Início rápido
```

## 📦 Estrutura de Deploy

### Backend (Vercel Serverless)
- **Entry Point**: `backend/api/index.js`
- **Handler**: Exporta app Express
- **Banco**: SQLite em `/tmp` (Vercel)
- **Uploads**: Temporários em `/tmp/uploads`

### Frontend (Vercel Static)
- **Build**: `npm run build`
- **Output**: `dist/`
- **Framework**: Vite
- **Routing**: SPA (configurado no vercel.json)

## 🔧 Arquivos de Configuração

### Backend
- `vercel.json` - Configuração Vercel
- `.env.example` - Variáveis de ambiente exemplo
- `package.json` - Dependências e scripts

### Frontend
- `vercel.json` - Configuração Vercel
- `.env.example` - Variáveis de ambiente exemplo
- `vite.config.ts` - Configuração Vite
- `tailwind.config.js` - Configuração Tailwind

## 📝 Documentação

- `README.md` - Visão geral do projeto
- `DEPLOY.md` - Guia completo de deploy
- `GIT_SETUP.md` - Configuração Git/GitHub
- `QUICK_START.md` - Início rápido
- `backend/MAKE_WEBHOOK_SETUP.md` - Config Make.com


# 🚀 Guia de Deploy na Vercel

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Repositório no GitHub: `https://github.com/TozatoRodrigo/disparodeemails_leads`
3. Webhook do Make.com configurado

## 🔧 Configuração do Deploy

### Passo 1: Conectar Repositório à Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New Project"**
3. Conecte o repositório `disparodeemails_leads`
4. Configure dois projetos separados:
   - **Backend** (Root Directory: `backend`)
   - **Frontend** (Root Directory: `frontend`)

### Passo 2: Deploy do Backend

**Configurações do Projeto Backend:**

- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: (deixar vazio ou `npm install`)
- **Output Directory**: (deixar vazio)
- **Install Command**: `npm install`

**Variáveis de Ambiente (Backend):**

```
MAKE_WEBHOOK_URL=https://hook.us2.make.com/seu-webhook
BACKEND_URL=https://seu-backend.vercel.app
FRONTEND_URL=https://seu-frontend.vercel.app
NODE_ENV=production
```

### Passo 3: Deploy do Frontend

**Configurações do Projeto Frontend:**

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Variáveis de Ambiente (Frontend):**

```
VITE_API_URL=https://seu-backend.vercel.app
```

⚠️ **Importante**: Substitua `seu-backend.vercel.app` pela URL real do backend após o primeiro deploy.

### Passo 4: Atualizar URLs

Após o primeiro deploy:

1. **Copie a URL do backend** (ex: `email-dispatcher-backend.vercel.app`)
2. **Atualize as variáveis de ambiente**:
   - No **Backend**: `BACKEND_URL` e `FRONTEND_URL`
   - No **Frontend**: `VITE_API_URL`
3. **Redeploy** ambos os projetos

## 🔄 Deploy Automático

Após a configuração inicial, cada push para `main` ou `master` fará deploy automático.

## 📝 Estrutura de URLs

Após o deploy, você terá:

- **Backend**: `https://seu-backend.vercel.app`
- **Frontend**: `https://seu-frontend.vercel.app`

## 🔍 Verificar Deploy

### Backend

```bash
curl https://seu-backend.vercel.app/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### Frontend

Acesse: `https://seu-frontend.vercel.app`

## ⚠️ Limitações da Vercel

### Backend (Serverless)

- **Tempo limite**: 10s (Hobby) ou 60s (Pro)
- **Banco de dados**: SQLite em `/tmp` (temporário)
- **Uploads**: Arquivos temporários em `/tmp`

**Recomendação**: Para produção, considere usar um banco de dados externo (PostgreSQL, MongoDB) e armazenamento de arquivos (S3, Cloudinary).

### Frontend

- **Build estático**: Funciona perfeitamente
- **SPA Routing**: Configurado no `vercel.json`

## 🐛 Troubleshooting

### Erro: "Cannot find module"

- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente antes de commitar

### Erro: "Database locked"

- Na Vercel, o SQLite pode ter problemas com múltiplas instâncias
- Considere migrar para PostgreSQL ou outro banco

### Frontend não conecta ao Backend

- Verifique `VITE_API_URL` no frontend
- Verifique CORS no backend
- Verifique se `FRONTEND_URL` no backend está correto

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)


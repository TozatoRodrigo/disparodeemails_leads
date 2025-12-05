# ⚡ Quick Start - Deploy na Vercel

## 🚀 Deploy Rápido (5 minutos)

### 1. Preparar Repositório

```bash
cd /Volumes/Projetos/Prospecçao

# Inicializar Git (se ainda não feito)
git init

# Adicionar remote
git remote add origin https://github.com/TozatoRodrigo/disparodeemails_leads.git

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "feat: sistema completo de disparo de emails"

# Push
git branch -M main
git push -u origin main
```

### 2. Deploy Backend na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New Project** → Import `disparodeemails_leads`
3. **Configurações:**
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (deixar vazio)
   - **Output Directory**: (deixar vazio)
4. **Environment Variables:**
   ```
   MAKE_WEBHOOK_URL=https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j
   BACKEND_URL=https://seu-backend.vercel.app (será preenchido após deploy)
   FRONTEND_URL=https://seu-frontend.vercel.app (será preenchido após deploy)
   NODE_ENV=production
   ```
5. **Deploy**

### 3. Deploy Frontend na Vercel

1. **Add New Project** → Import `disparodeemails_leads` (novo projeto)
2. **Configurações:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables:**
   ```
   VITE_API_URL=https://seu-backend.vercel.app (URL do backend do passo 2)
   ```
4. **Deploy**

### 4. Atualizar URLs

Após ambos os deploys:

1. **Copie as URLs**:
   - Backend: `https://seu-backend.vercel.app`
   - Frontend: `https://seu-frontend.vercel.app`

2. **Atualize Environment Variables**:
   - **Backend**: Atualize `BACKEND_URL` e `FRONTEND_URL`
   - **Frontend**: Atualize `VITE_API_URL`
   
3. **Redeploy** ambos os projetos

### 5. Testar

- Backend: `https://seu-backend.vercel.app/health`
- Frontend: `https://seu-frontend.vercel.app`

## ✅ Pronto!

Seu sistema está em produção! 🎉

## 📝 Próximos Passos

1. Configure o cenário no Make.com (veja `backend/MAKE_WEBHOOK_SETUP.md`)
2. Teste o upload de CSV ou colar JSON
3. Monitore os logs na Vercel

## 🔄 Deploy Automático

A partir de agora, cada push para `main` fará deploy automático!


# 🚀 Deploy Automático na Vercel

## ✅ GitHub Configurado!

Seu código já está no GitHub: https://github.com/TozatoRodrigo/disparodeemails_leads

## 🌐 Deploy na Vercel (Passo a Passo)

### 1. Acesse a Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**

### 2. Deploy do Backend

**Importar Projeto:**
- Selecione o repositório: `TozatoRodrigo/disparodeemails_leads`
- Clique em **"Import"**

**Configurações do Projeto:**
- **Project Name**: `email-dispatcher-backend` (ou qualquer nome)
- **Framework Preset**: **Other**
- **Root Directory**: `backend` ⚠️ **IMPORTANTE**
- **Build Command**: (deixar vazio)
- **Output Directory**: (deixar vazio)
- **Install Command**: `npm install`

**Environment Variables:**
Clique em **"Environment Variables"** e adicione:

```
MAKE_WEBHOOK_URL = https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j
NODE_ENV = production
```

⚠️ **Deixe `BACKEND_URL` e `FRONTEND_URL` vazios por enquanto** (vamos preencher depois)

**Deploy:**
- Clique em **"Deploy"**
- Aguarde o deploy concluir
- **Copie a URL** gerada (ex: `email-dispatcher-backend-xxx.vercel.app`)

### 3. Deploy do Frontend

**Novo Projeto:**
1. Volte para o Dashboard
2. Clique em **"Add New Project"** novamente
3. Selecione o mesmo repositório: `TozatoRodrigo/disparodeemails_leads`

**Configurações do Projeto:**
- **Project Name**: `email-dispatcher-frontend` (ou qualquer nome)
- **Framework Preset**: **Vite** (ou Other)
- **Root Directory**: `frontend` ⚠️ **IMPORTANTE**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables:**
```
VITE_API_URL = https://seu-backend.vercel.app
```
⚠️ **Substitua `seu-backend.vercel.app` pela URL real do backend** (do passo 2)

**Deploy:**
- Clique em **"Deploy"**
- Aguarde o deploy concluir
- **Copie a URL** gerada (ex: `email-dispatcher-frontend-xxx.vercel.app`)

### 4. Atualizar URLs

**No Backend:**
1. Vá para as configurações do projeto backend na Vercel
2. **Settings** → **Environment Variables**
3. Adicione/Atualize:
   ```
   BACKEND_URL = https://sua-url-backend.vercel.app
   FRONTEND_URL = https://sua-url-frontend.vercel.app
   ```
4. **Redeploy** o projeto

**No Frontend:**
1. Vá para as configurações do projeto frontend na Vercel
2. **Settings** → **Environment Variables**
3. Verifique se `VITE_API_URL` está correto
4. Se necessário, **Redeploy** o projeto

### 5. Testar

**Backend:**
```bash
curl https://sua-url-backend.vercel.app/health
```
Deve retornar: `{"status":"ok","timestamp":"..."}`

**Frontend:**
Acesse: `https://sua-url-frontend.vercel.app`

## ✅ Deploy Automático Configurado

A partir de agora, cada push para `main` fará deploy automático!

## 🔄 Próximos Deploys

Após fazer mudanças no código:

```bash
git add .
git commit -m "descrição das mudanças"
git push
```

A Vercel fará deploy automático! 🚀

## 📝 Notas Importantes

- **Root Directory** é CRÍTICO: deve ser `backend` ou `frontend`
- **Environment Variables** devem ser configuradas em cada projeto
- **Primeiro deploy** pode demorar alguns minutos
- **Redeploy** é necessário após mudar variáveis de ambiente

## 🆘 Troubleshooting

### Erro: "Cannot find module"
- Verifique se o Root Directory está correto
- Verifique se todas as dependências estão no package.json

### Frontend não conecta ao Backend
- Verifique `VITE_API_URL` no frontend
- Verifique CORS no backend (`FRONTEND_URL`)

### Erro de build
- Verifique os logs na Vercel
- Teste localmente primeiro: `npm run build`


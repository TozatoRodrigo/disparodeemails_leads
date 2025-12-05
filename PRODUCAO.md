# 🌐 URLs de Produção

## ✅ Projetos Deployados na Vercel

### Backend
- **URL**: https://disparodeemails-leads-backend.vercel.app
- **Health Check**: https://disparodeemails-leads-backend.vercel.app/health
- **Status**: ✅ Deployado

### Frontend
- **URL**: https://disparodeemails-leads-frontend.vercel.app
- **Status**: ✅ Deployado

## 🔧 Variáveis de Ambiente Configuradas

### Backend (Vercel)
```
MAKE_WEBHOOK_URL=https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j
BACKEND_URL=https://disparodeemails-leads-backend.vercel.app
FRONTEND_URL=https://disparodeemails-leads-frontend.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://disparodeemails-leads-backend.vercel.app
```

## 🧪 Testar Produção

### Backend
```bash
curl https://disparodeemails-leads-backend.vercel.app/health
```

### Frontend
Acesse: https://disparodeemails-leads-frontend.vercel.app

## 📡 Endpoints de Produção

- **Upload CSV**: `POST https://disparodeemails-leads-backend.vercel.app/api/upload`
- **Status**: `GET https://disparodeemails-leads-backend.vercel.app/api/upload/status/:batchId`
- **Histórico**: `GET https://disparodeemails-leads-backend.vercel.app/api/upload/history`
- **Webhook**: `POST https://disparodeemails-leads-backend.vercel.app/api/webhook/resultado`

## 🔄 Deploy Automático

Cada push para `main` no GitHub fará deploy automático na Vercel!

## 📝 Notas

- URLs são HTTPS automaticamente
- Deploy automático configurado
- CORS configurado para produção
- Banco de dados SQLite em `/tmp` (Vercel)


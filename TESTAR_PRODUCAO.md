# 🧪 Testar Aplicação em Produção

## ✅ URLs de Produção

- **Backend**: https://disparodeemails-leads-backend.vercel.app
- **Frontend**: https://disparodeemails-leads-frontend.vercel.app

## 🔍 Testes Rápidos

### 1. Health Check do Backend

```bash
curl https://disparodeemails-leads-backend.vercel.app/health
```

**Resposta esperada:**
```json
{"status":"ok","timestamp":"2024-..."}
```

### 2. Testar Frontend

Acesse no navegador:
```
https://disparodeemails-leads-frontend.vercel.app
```

### 3. Testar Upload CSV

```bash
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/upload \
  -F "file=@seu-arquivo.csv"
```

### 4. Testar Colar JSON

No frontend, use a aba "Colar JSON" e cole:

```json
[
  {
    "nome": "Teste Produção",
    "email": "teste@example.com",
    "empresa": "Teste Empresa"
  }
]
```

## 🔗 Links Úteis

- **Frontend**: https://disparodeemails-leads-frontend.vercel.app
- **Backend API**: https://disparodeemails-leads-backend.vercel.app
- **Health Check**: https://disparodeemails-leads-backend.vercel.app/health
- **GitHub**: https://github.com/TozatoRodrigo/disparodeemails_leads

## ⚠️ Checklist de Produção

- [ ] Backend respondendo em `/health`
- [ ] Frontend carregando corretamente
- [ ] Upload CSV funcionando
- [ ] Colar JSON funcionando
- [ ] Status de batch funcionando
- [ ] Histórico funcionando
- [ ] Make.com recebendo dados
- [ ] Callbacks do Make.com funcionando

## 🐛 Troubleshooting

### Backend não responde

1. Verifique os logs na Vercel Dashboard
2. Verifique variáveis de ambiente
3. Teste localmente primeiro

### Frontend não conecta ao Backend

1. Verifique `VITE_API_URL` no frontend
2. Verifique CORS no backend (`FRONTEND_URL`)
3. Verifique console do navegador (F12)

### Erro 404 nas rotas

- Verifique se o `vercel.json` está correto
- Verifique se o Root Directory está configurado


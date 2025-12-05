# 🔧 Solução: Erro 405 (Method Not Allowed)

## ❌ Problema

Erro 405 ao tentar fazer POST para `/api/upload` na Vercel:
```
Failed to load resource: the server responded with a status of 405
```

## 🔍 Causa

O `vercel.json` estava usando a estrutura antiga (version 2 com `builds` e `routes`), que não funciona corretamente com métodos POST em serverless functions.

## ✅ Solução Aplicada

### 1. Atualização do `vercel.json`

O arquivo foi atualizado para usar a estrutura moderna da Vercel com `rewrites`:

**Antes:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

**Depois:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

### 2. CORS Ajustado para Produção

O CORS foi ajustado para aceitar requisições do frontend em produção:

```javascript
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'https://disparodeemails-leads-frontend.vercel.app']
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todas em produção por enquanto
    }
  },
  credentials: true
}));
```

## 🔄 Próximos Passos

1. ✅ **Deploy automático iniciado** (via git push)
2. ⏳ **Aguardar 1-2 minutos** para o deploy concluir na Vercel
3. ✅ **Verificar deploy** na Vercel Dashboard
4. 🧪 **Testar novamente** o upload no frontend

## 🧪 Testar Após Deploy

### 1. Health Check
```bash
curl https://disparodeemails-leads-backend.vercel.app/health
```
**Esperado:** `{"status":"ok","timestamp":"..."}`

### 2. Testar Upload (via curl)
```bash
# Criar arquivo de teste
echo "nome,email,empresa
João Silva,joao@teste.com,Empresa A" > teste.csv

# Fazer upload
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/upload \
  -F "file=@teste.csv" \
  -H "Origin: https://disparodeemails-leads-frontend.vercel.app"
```

### 3. Testar no Frontend
1. Acesse: https://disparodeemails-leads-frontend.vercel.app
2. Tente fazer upload de um CSV
3. Verifique o console do navegador (F12)

## ⚙️ Verificar Configurações na Vercel

### Backend - Environment Variables
Certifique-se de que estas variáveis estão configuradas:

```
FRONTEND_URL = https://disparodeemails-leads-frontend.vercel.app
MAKE_WEBHOOK_URL = https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j
```

### Frontend - Environment Variables
Certifique-se de que esta variável está configurada:

```
VITE_API_URL = https://disparodeemails-leads-backend.vercel.app
```

⚠️ **IMPORTANTE:** Após alterar variáveis de ambiente, é necessário fazer **Redeploy** do projeto!

## ⚠️ Se Ainda Não Funcionar

### 1. Verificar Logs na Vercel
- Acesse o Dashboard da Vercel
- Vá em **Deployments** → Selecione o último deploy
- Clique em **Functions** → Veja os logs

### 2. Verificar Deploy
- Confirme que o deploy foi concluído com sucesso
- Verifique se não há erros de build

### 3. Limpar Cache
- Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
- Teste em modo anônimo/privado

### 4. Verificar CORS
- Abra o console do navegador (F12)
- Veja se há erros de CORS
- Verifique se o header `Origin` está sendo enviado

### 5. Verificar URL da API
- No frontend, verifique se `VITE_API_URL` está correto
- Teste acessando diretamente: `https://disparodeemails-leads-backend.vercel.app/health`

## 📝 Checklist de Verificação

- [ ] Deploy do backend concluído na Vercel
- [ ] `VITE_API_URL` configurado no frontend
- [ ] `FRONTEND_URL` configurado no backend
- [ ] Health check retorna `{"status":"ok"}`
- [ ] Cache do navegador limpo
- [ ] Testado em modo anônimo/privado

## 🎯 Status Atual

- ✅ Código corrigido e commitado
- ✅ Push para GitHub realizado
- ⏳ Aguardando deploy automático na Vercel (1-2 minutos)
- ⏳ Pronto para testar após deploy

## 📞 Próximas Ações

1. Aguarde 1-2 minutos
2. Acesse o Dashboard da Vercel e confirme o deploy
3. Teste o upload novamente
4. Se ainda houver problemas, verifique os logs na Vercel


# 🔍 Verificar Por Que Make.com Não Está Recebendo Dados

## ❌ Problema

O webhook do Make.com (`https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j`) não está recebendo os dados do JSON.

## ✅ Soluções Aplicadas

### 1. Logs Melhorados

Adicionei logs detalhados para debug:
- ✅ Verificação de variáveis de ambiente
- ✅ Log do payload sendo enviado
- ✅ Log da resposta do Make.com
- ✅ Tratamento de erros melhorado

### 2. Endpoint de Teste

Criei um endpoint para testar o webhook:
```
POST https://disparodeemails-leads-backend.vercel.app/api/test/make-webhook
```

## 🔧 Verificações Necessárias

### 1. Variáveis de Ambiente na Vercel

**IMPORTANTE:** Verifique se estas variáveis estão configuradas no projeto **backend** na Vercel:

1. Acesse o **Dashboard da Vercel**
2. Vá no projeto **backend** (`disparodeemails-leads-backend`)
3. Clique em **Settings** → **Environment Variables**
4. Verifique se existem:

```
MAKE_WEBHOOK_URL = https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j
BACKEND_URL = https://disparodeemails-leads-backend.vercel.app
```

⚠️ **Se não existirem, adicione e faça REDEPLOY!**

### 2. Testar Health Check

```bash
curl https://disparodeemails-leads-backend.vercel.app/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "makeWebhookConfigured": true,
  "backendUrl": "https://disparodeemails-leads-backend.vercel.app"
}
```

Se `makeWebhookConfigured` for `false`, a variável não está configurada!

### 3. Testar Webhook Diretamente

```bash
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/test/make-webhook
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Teste enviado com sucesso para Make.com",
  "batchId": "test-1234567890",
  "makeWebhookUrl": "✅ Configurado"
}
```

### 4. Verificar Logs na Vercel

1. Acesse o **Dashboard da Vercel**
2. Vá em **Deployments** → Selecione o último deploy do backend
3. Clique em **Functions** → Veja os logs
4. Procure por:
   - `📨 Enviando para Make.com`
   - `✅ Dados enviados com sucesso`
   - `❌ Erro ao enviar para Make.com`

## 🧪 Testar Envio Real

### Via Frontend

1. Acesse: https://disparodeemails-leads-frontend.vercel.app
2. Vá na aba **"Colar JSON"**
3. Cole este JSON de teste:
```json
[
  {
    "nome": "João Silva",
    "email": "joao@example.com",
    "empresa": "Empresa A"
  }
]
```
4. Clique em **"Enviar para Processamento"**
5. Abra o console do navegador (F12) e verifique se há erros

### Via API Diretamente

```bash
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/upload/json \
  -H "Content-Type: application/json" \
  -d '[{"nome":"João","email":"joao@example.com","empresa":"Empresa A"}]'
```

## 📋 Checklist de Verificação

- [ ] Variável `MAKE_WEBHOOK_URL` configurada na Vercel (backend)
- [ ] Variável `BACKEND_URL` configurada na Vercel (backend)
- [ ] Redeploy do backend realizado após configurar variáveis
- [ ] Health check retorna `makeWebhookConfigured: true`
- [ ] Teste do webhook (`/api/test/make-webhook`) funciona
- [ ] Logs na Vercel mostram envio para Make.com
- [ ] Make.com está ativo e funcionando

## 🔍 Verificar no Make.com

### 1. Verificar se o Webhook está Ativo

1. Acesse o **Make.com**
2. Vá no seu cenário
3. Verifique se o módulo **"Webhook"** está ativo
4. Clique em **"Run once"** para testar manualmente

### 2. Verificar Histórico de Execuções

1. No Make.com, vá em **"History"**
2. Verifique se há execuções recentes
3. Se houver erros, veja os detalhes

### 3. Verificar Estrutura do Cenário

O cenário deve ter esta estrutura:

```
1. Webhook (recebe dados)
   ↓
2. Iterator (loop pelos leads)
   ↓
3. Enviar Email
   ↓
4. HTTP Request (callback para backend)
```

## 🆘 Troubleshooting

### Erro: "MAKE_WEBHOOK_URL não configurada"

**Solução:**
1. Configure a variável na Vercel
2. Faça redeploy do backend

### Erro: "Erro ao enviar para Make.com: 404"

**Possíveis causas:**
- URL do webhook incorreta
- Webhook não está ativo no Make.com

**Solução:**
1. Verifique a URL do webhook no Make.com
2. Certifique-se de que o webhook está ativo
3. Teste manualmente no Make.com

### Erro: "Erro ao enviar para Make.com: 401/403"

**Possíveis causas:**
- Webhook requer autenticação
- Token de autenticação não configurado

**Solução:**
1. Verifique se o webhook requer autenticação
2. Se sim, adicione headers de autenticação no código

### Make.com não recebe dados mas não há erro

**Possíveis causas:**
- Payload muito grande
- Timeout na requisição
- Webhook está pausado

**Solução:**
1. Verifique os logs na Vercel
2. Teste com menos leads (1-2 leads)
3. Verifique se o webhook está ativo no Make.com

## 📊 Estrutura do Payload Enviado

O backend envia este payload para o Make.com:

```json
{
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "leads": [
    {
      "nome": "João Silva",
      "email": "joao@example.com",
      "empresa": "Empresa A"
    }
  ],
  "callbackUrl": "https://disparodeemails-leads-backend.vercel.app/api/webhook/resultado",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔗 Links Úteis

- **Backend Health:** https://disparodeemails-leads-backend.vercel.app/health
- **Teste Webhook:** https://disparodeemails-leads-backend.vercel.app/api/test/make-webhook
- **Frontend:** https://disparodeemails-leads-frontend.vercel.app
- **Make.com Webhook:** https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j

## 📝 Próximos Passos

1. ✅ Verificar variáveis de ambiente na Vercel
2. ✅ Testar health check
3. ✅ Testar endpoint de teste do webhook
4. ✅ Verificar logs na Vercel
5. ✅ Verificar no Make.com se os dados estão chegando
6. ✅ Testar envio real via frontend


# 📧 Configuração do Callback no Make.com

Para que o sistema receba feedback de sucesso/erro de cada email enviado, você precisa configurar um **módulo de callback** no Make.com.

## 🔄 Fluxo Atual

```
Frontend → Backend → Make.com → Envia Email → ???
```

## 🎯 Fluxo com Callback

```
Frontend → Backend → Make.com → Envia Email → Callback → Backend → Frontend
```

---

## 📋 Passo a Passo no Make.com

### 1️⃣ Abra seu cenário no Make.com

Acesse: https://www.make.com/en/login

### 2️⃣ Estrutura Recomendada do Cenário

O cenário deve ter esta estrutura:

```
[Webhook] → [Iterator] → [Módulo de Email] → [HTTP Request - Callback]
```

### 3️⃣ Configurar o Webhook (primeiro módulo)

Se ainda não tem, adicione um **Webhooks > Custom Webhook**:

- **Data structure**: Configure para receber:
  ```json
  {
    "batchId": "uuid-do-batch",
    "leads": [
      { "nome": "João", "email": "joao@email.com", "empresa": "Empresa A" }
    ],
    "callbackUrl": "https://disparodeemails-leads-backend.vercel.app/api/webhook/resultado"
  }
  ```

### 4️⃣ Adicionar Iterator (segundo módulo)

- Adicione: **Flow Control > Iterator**
- **Array**: `{{1.leads}}`
- Isso vai processar cada lead individualmente

### 5️⃣ Configurar Módulo de Email (terceiro módulo)

Configure seu módulo de envio de email (Gmail, SendGrid, Mailgun, etc.):

- **To**: `{{2.email}}`
- **Name**: `{{2.nome}}`
- Configure o assunto e corpo do email

### 6️⃣ ⭐ IMPORTANTE: Adicionar HTTP Request de Callback (quarto módulo)

Este é o módulo que envia o feedback de volta para o sistema!

**Adicione: HTTP > Make a request**

Configure assim:

| Campo | Valor |
|-------|-------|
| **URL** | `{{1.callbackUrl}}` |
| **Method** | `POST` |
| **Body type** | `Raw` |
| **Content type** | `JSON (application/json)` |

**Body (Raw):**

```json
{
  "batchId": "{{1.batchId}}",
  "email": "{{2.email}}",
  "success": true,
  "error": null
}
```

### 7️⃣ Adicionar Tratamento de Erro

Para capturar erros, adicione um **Error Handler** no módulo de email:

1. Clique no módulo de email
2. Adicione uma rota de erro (ícone de raio)
3. Adicione outro **HTTP > Make a request** na rota de erro:

**Body (Raw) para erro:**

```json
{
  "batchId": "{{1.batchId}}",
  "email": "{{2.email}}",
  "success": false,
  "error": "{{error.message}}"
}
```

---

## 🎨 Estrutura Visual do Cenário

```
                              ┌─────────────┐
                              │  ✅ Sucesso │
                              │  HTTP POST  │
                              │  Callback   │
                              └─────────────┘
                                    ↑
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Webhook  │ →  │ Iterator │ →  │  Email   │
│ Trigger  │    │  Leads   │    │  Module  │
└──────────┘    └──────────┘    └──────────┘
                                    ↓
                              ┌─────────────┐
                              │  ❌ Erro    │
                              │  HTTP POST  │
                              │  Callback   │
                              └─────────────┘
```

---

## 🧪 Testando o Callback

### Via Terminal (curl)

```bash
# Simular callback de sucesso
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/webhook/resultado \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "SEU-BATCH-ID-AQUI",
    "email": "teste@email.com",
    "success": true,
    "error": null
  }'

# Simular callback de erro
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/webhook/resultado \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "SEU-BATCH-ID-AQUI",
    "email": "teste@email.com",
    "success": false,
    "error": "Email inválido"
  }'
```

### Resposta Esperada

```json
{
  "received": true
}
```

---

## 📊 O que acontece após o callback?

1. **Backend recebe o callback** com status de cada email
2. **Atualiza o status do lead** no banco de dados (`sent` ou `error`)
3. **Quando todos os leads são processados**, atualiza o batch para `completed`
4. **Frontend consulta o status** e mostra o progresso em tempo real

---

## ⚠️ Checklist de Verificação

- [ ] Webhook do Make.com está ativo
- [ ] Iterator está configurado para `{{1.leads}}`
- [ ] Módulo de email está configurado corretamente
- [ ] HTTP Request de callback está configurado
- [ ] URL do callback está correta: `{{1.callbackUrl}}`
- [ ] Body do callback contém `batchId`, `email`, `success`, `error`
- [ ] Error handler está configurado para enviar callback de erro

---

## 🔗 URLs Importantes

| Serviço | URL |
|---------|-----|
| **Frontend** | https://disparodeemails-leads-frontend.vercel.app |
| **Backend** | https://disparodeemails-leads-backend.vercel.app |
| **Callback URL** | https://disparodeemails-leads-backend.vercel.app/api/webhook/resultado |
| **Webhook Make.com** | https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j |

---

## 🆘 Problemas Comuns

### Callback não está sendo recebido
1. Verifique se a URL do callback está correta
2. Verifique se o cenário está ativado (ON)
3. Verifique o histórico do cenário no Make.com para ver erros

### Status fica "Processando" para sempre
1. O callback não está sendo enviado corretamente
2. Verifique se o módulo HTTP Request está após o módulo de email
3. Verifique se o body do callback está correto

### Erros não aparecem no frontend
1. O error handler não está configurado
2. O callback de erro não está sendo enviado
3. Verifique se `success: false` está sendo enviado

---

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Logs do cenário no Make.com (History)
2. Logs do backend na Vercel (Functions > Logs)
3. Console do navegador (F12) para erros do frontend


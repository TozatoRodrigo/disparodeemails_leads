# 🔗 Configuração do Webhook Make.com

Este guia explica como configurar o webhook do Make.com para receber os dados do backend e enviar e-mails.

## 📋 Índice

1. [Obter URL do Webhook](#1-obter-url-do-webhook)
2. [Configurar no Backend](#2-configurar-no-backend)
3. [Configurar Cenário no Make.com](#3-configurar-cenário-no-makecom)
4. [Estrutura de Dados](#4-estrutura-de-dados)
5. [Testar Integração](#5-testar-integração)

---

## 1. Obter URL do Webhook

### Passo a Passo:

1. Acesse [Make.com](https://www.make.com) e faça login
2. Crie um novo cenário (Scenario) ou abra um existente
3. Adicione um módulo **"Webhooks" > "Custom webhook"**
4. Clique em **"Add"** para criar um novo webhook
5. Configure:
   - **Webhook name**: `Email Dispatcher` (ou qualquer nome)
   - **Method**: `POST`
   - Clique em **"Save"**
6. **Copie a URL do webhook** que será gerada (exemplo: `https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j`)

---

## 2. Configurar no Backend

### 2.1. Editar arquivo `.env`

Abra o arquivo `.env` na raiz do projeto e configure:

```env
PORT=3001
MAKE_WEBHOOK_URL=https://hook.us2.make.com/SUA-URL-AQUI
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

**Importante:** 
- Substitua `SUA-URL-AQUI` pela URL do webhook que você copiou
- Se estiver em produção, atualize `BACKEND_URL` para sua URL pública (ex: `https://seu-dominio.com`)

### 2.2. Verificar configuração

O backend enviará automaticamente os dados para o webhook quando um CSV for enviado via `/api/upload`.

---

## 3. Configurar Cenário no Make.com

### 3.1. Estrutura do Cenário

O cenário no Make.com deve ter a seguinte estrutura:

```
[Webhook] → [Loop] → [Enviar Email] → [HTTP Request - Callback]
```

### 3.2. Módulo 1: Webhook (Custom webhook)

- **Já configurado** no passo 1
- Este módulo recebe os dados do backend

### 3.3. Módulo 2: Iterator (Loop)

1. Adicione um módulo **"Flow control" > "Iterator"**
2. Configure:
   - **Array**: `{{1.leads}}` (os leads recebidos do webhook)
   - Isso criará um loop para cada lead

### 3.4. Módulo 3: Enviar Email

1. Adicione um módulo de email (ex: **"Email" > "Send an email"**)
2. Configure os campos:
   - **To**: `{{2.email}}`
   - **Subject**: `Olá {{2.nome}}`
   - **Body**: Configure seu template de email
   - Use `{{2.nome}}`, `{{2.email}}`, `{{2.empresa}}` para personalizar

**Exemplo de Body:**
```
Olá {{2.nome}},

Bem-vindo à nossa plataforma!

{{#if 2.empresa}}
Vejo que você trabalha na {{2.empresa}}.
{{/if}}

Atenciosamente,
Equipe
```

### 3.5. Módulo 4: HTTP Request (Callback)

Após enviar cada email, você precisa enviar o resultado de volta para o backend.

1. Adicione um módulo **"HTTP" > "Make an HTTP request"**
2. Configure:
   - **Method**: `POST`
   - **URL**: `{{1.callbackUrl}}` (vem do webhook inicial)
   - **Headers**:
     ```
     Content-Type: application/json
     ```
   - **Body** (JSON):
     ```json
     {
       "batchId": "{{1.batchId}}",
       "email": "{{2.email}}",
       "success": true,
       "error": null
     }
     ```

**Para casos de erro:**
- Configure um **"Router"** antes do HTTP Request
- Rota 1: Sucesso → `success: true`
- Rota 2: Erro → `success: false, error: "Mensagem de erro"`

---

## 4. Estrutura de Dados

### 4.1. Dados Recebidos do Backend

Quando o backend envia dados para o Make.com, o payload é:

```json
{
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "leads": [
    {
      "nome": "João Silva",
      "email": "joao@example.com",
      "empresa": "Empresa A"
    },
    {
      "nome": "Maria Santos",
      "email": "maria@example.com",
      "empresa": null
    }
  ],
  "callbackUrl": "http://localhost:3001/api/webhook/resultado",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4.2. Dados Enviados no Callback

O Make.com deve enviar de volta:

**Sucesso:**
```json
{
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao@example.com",
  "success": true
}
```

**Erro:**
```json
{
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao@example.com",
  "success": false,
  "error": "Email inválido ou rejeitado"
}
```

---

## 5. Testar Integração

### 5.1. Testar Webhook Manualmente

Você pode testar o webhook diretamente no Make.com:

1. No módulo Webhook, clique em **"Run once"**
2. Use este JSON de teste:
```json
{
  "batchId": "test-123",
  "leads": [
    {
      "nome": "Teste",
      "email": "teste@example.com",
      "empresa": "Teste Empresa"
    }
  ],
  "callbackUrl": "http://localhost:3001/api/webhook/resultado",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5.2. Testar Upload Real

1. Crie um arquivo CSV de teste:
```csv
nome,email,empresa
João Silva,joao@example.com,Empresa A
Maria Santos,maria@example.com,
```

2. Faça upload via API:
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@teste.csv"
```

3. Verifique o status:
```bash
curl http://localhost:3001/api/upload/status/BATCH_ID_AQUI
```

### 5.3. Verificar Logs

No Make.com:
- Verifique se o cenário está executando
- Veja os logs de cada módulo
- Confirme que os callbacks estão sendo enviados

No Backend:
- Verifique os logs no console
- Use `GET /api/upload/status/:batchId` para ver o progresso

---

## 🔧 Troubleshooting

### Problema: Webhook não recebe dados

**Soluções:**
- Verifique se a URL no `.env` está correta
- Confirme que o webhook está ativo no Make.com
- Verifique os logs do backend (console)

### Problema: Callback não está funcionando

**Soluções:**
- Verifique se `BACKEND_URL` está correto no `.env`
- Confirme que o backend está acessível na URL configurada
- Se estiver em desenvolvimento local, use um túnel (ngrok) para expor o backend

### Problema: Emails não estão sendo enviados

**Soluções:**
- Verifique a configuração do módulo de email no Make.com
- Confirme que as credenciais de email estão corretas
- Verifique os logs do Make.com para erros específicos

---

## 📝 Exemplo Completo de Cenário Make.com

```
┌─────────────────┐
│  Custom Webhook│ ← Recebe dados do backend
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Iterator     │ ← Loop pelos leads
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send an Email  │ ← Envia email para cada lead
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      Router     │ ← Roteia sucesso/erro
└────────┬────────┘
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Success │ │ Error  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌─────────────────┐
│ HTTP Request    │ ← Envia callback para backend
└─────────────────┘
```

---

## 🚀 Próximos Passos

1. ✅ Configure o webhook no Make.com
2. ✅ Configure o `.env` do backend
3. ✅ Crie o cenário no Make.com
4. ✅ Teste com um CSV pequeno
5. ✅ Monitore os logs e status
6. ✅ Ajuste templates de email conforme necessário

---

## 📚 Recursos Adicionais

- [Documentação Make.com](https://www.make.com/en/help)
- [Webhooks Make.com](https://www.make.com/en/help/modules/webhooks)
- [Email Modules](https://www.make.com/en/help/modules/email)


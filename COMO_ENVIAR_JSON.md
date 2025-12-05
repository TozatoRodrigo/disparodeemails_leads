# 📋 Como Enviar JSON ao Invés de CSV

## ✅ Sim! Você pode enviar JSON diretamente

O sistema agora suporta **envio direto de JSON**, sem precisar converter para CSV!

## 🎯 Como Usar

### 1. Via Frontend (Recomendado)

1. Acesse: https://disparodeemails-leads-frontend.vercel.app
2. Clique na aba **"Colar JSON"**
3. Cole seu JSON no formato abaixo
4. Clique em **"Enviar para Processamento"**

### 2. Formatos Aceitos

#### Formato 1: Array direto
```json
[
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
]
```

#### Formato 2: Objeto com propriedade "leads"
```json
{
  "leads": [
    {
      "nome": "João Silva",
      "email": "joao@example.com",
      "empresa": "Empresa A"
    }
  ]
}
```

### 3. Via API Diretamente (curl)

```bash
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/upload/json \
  -H "Content-Type: application/json" \
  -d '[
    {
      "nome": "João Silva",
      "email": "joao@example.com",
      "empresa": "Empresa A"
    }
  ]'
```

### 4. Via JavaScript/Fetch

```javascript
const leads = [
  {
    nome: "João Silva",
    email: "joao@example.com",
    empresa: "Empresa A"
  }
];

const response = await fetch('https://disparodeemails-leads-backend.vercel.app/api/upload/json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(leads)
});

const result = await response.json();
console.log(result);
```

## 📝 Estrutura do JSON

### Campos Obrigatórios
- `nome` (string): Nome do lead
- `email` (string): Email do lead (deve ser válido)

### Campos Opcionais
- `empresa` (string | null): Nome da empresa

## ⚠️ Limitações

- **Máximo de 200 leads** por requisição
- **Email deve ser válido** (formato correto)
- **Nome e email são obrigatórios**

## 🔄 Diferenças entre CSV e JSON

| Característica | CSV | JSON |
|---------------|-----|------|
| **Endpoint** | `POST /api/upload` | `POST /api/upload/json` |
| **Content-Type** | `multipart/form-data` | `application/json` |
| **Processamento** | Converte CSV → Array | Usa JSON diretamente |
| **Performance** | Mais lento (conversão) | Mais rápido (direto) |

## ✅ Vantagens do JSON

1. **Mais rápido** - Não precisa converter CSV
2. **Mais simples** - Envia dados diretamente
3. **Melhor para APIs** - Formato nativo de APIs
4. **Menos processamento** - Menos conversões

## 📊 Resposta da API

```json
{
  "success": true,
  "batchId": "uuid-gerado",
  "totalLeads": 2,
  "leadsInvalidos": 0,
  "message": "Upload realizado com sucesso. 2 leads válidos processados."
}
```

## 🧪 Exemplo Completo

```bash
# Criar arquivo JSON
cat > leads.json << 'EOF'
[
  {
    "nome": "João Silva",
    "email": "joao@example.com",
    "empresa": "Empresa A"
  },
  {
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "empresa": "Empresa B"
  }
]
EOF

# Enviar
curl -X POST https://disparodeemails-leads-backend.vercel.app/api/upload/json \
  -H "Content-Type: application/json" \
  -d @leads.json
```

## 🆘 Troubleshooting

### Erro: "Formato JSON inválido"
- Verifique se o JSON está bem formatado
- Use um validador JSON online
- Certifique-se de usar aspas duplas (`"`)

### Erro: "Colunas obrigatórias ausentes"
- Certifique-se de que cada lead tem `nome` e `email`
- Verifique a ortografia dos campos

### Erro: "Limite de 200 leads excedido"
- Divida seu JSON em múltiplas requisições
- Cada requisição pode ter no máximo 200 leads

## 📚 Documentação Relacionada

- [README.md](./README.md) - Documentação principal
- [SOLUCAO_405.md](./SOLUCAO_405.md) - Solução para erro 405
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) - Guia de deploy


# 🔧 Correção: Erro 405 - URL da API Incorreta

## ❌ Problema

O frontend está tentando acessar:
```
https://disparodeemails-leads-frontend.vercel.app/disparodeemails-leads-backend.vercel.app/api/upload/json
```

Isso está errado! A URL está sendo construída incorretamente.

## ✅ Solução Aplicada

### 1. Código Corrigido

O código agora valida e corrige a URL automaticamente:

```typescript
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Se não tiver protocolo, adicionar https://
  if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    return `https://${envUrl}`;
  }
  
  // Se tiver protocolo, usar direto
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback para desenvolvimento local
  return 'http://localhost:3001';
};
```

### 2. Configurar Variável de Ambiente na Vercel

**IMPORTANTE:** Você precisa configurar a variável de ambiente `VITE_API_URL` no projeto frontend na Vercel:

1. Acesse o **Dashboard da Vercel**
2. Vá no projeto **frontend** (`disparodeemails-leads-frontend`)
3. Clique em **Settings** → **Environment Variables**
4. Adicione/Atualize:
   ```
   VITE_API_URL = https://disparodeemails-leads-backend.vercel.app
   ```
   ⚠️ **IMPORTANTE:** Use `https://` no início!

5. Clique em **Save**
6. Faça **Redeploy** do projeto frontend

### 3. Verificar Configuração

Após configurar, verifique:

1. **Variável configurada corretamente:**
   - ✅ `VITE_API_URL = https://disparodeemails-leads-backend.vercel.app`
   - ❌ `VITE_API_URL = disparodeemails-leads-backend.vercel.app` (sem https://)

2. **Redeploy realizado:**
   - Após alterar variáveis de ambiente, é necessário fazer redeploy

3. **Testar no navegador:**
   - Abra o console (F12)
   - Verifique se não há mais erros 405
   - Teste fazer upload de JSON

## 🧪 Testar Após Correção

1. Aguarde o redeploy do frontend (1-2 minutos)
2. Acesse: https://disparodeemails-leads-frontend.vercel.app
3. Abra o console (F12)
4. Tente fazer upload de JSON
5. Verifique se a URL está correta:
   ```
   POST https://disparodeemails-leads-backend.vercel.app/api/upload/json
   ```

## 📝 Checklist

- [ ] Variável `VITE_API_URL` configurada na Vercel (frontend)
- [ ] URL inclui `https://` no início
- [ ] Redeploy do frontend realizado
- [ ] Testado no navegador (sem erros 405)
- [ ] Upload de JSON funcionando

## 🆘 Se Ainda Não Funcionar

1. **Limpar cache do navegador** (Ctrl+Shift+R)
2. **Verificar logs na Vercel** (Deployments → Functions)
3. **Verificar variável de ambiente** (Settings → Environment Variables)
4. **Testar em modo anônimo/privado**
5. **Verificar console do navegador** - O código agora mostra a URL sendo usada no console

## 🔍 Debug

O código agora inclui um `console.log` que mostra a URL sendo usada. Abra o console do navegador (F12) e verifique:

- ✅ URL correta: `https://disparodeemails-leads-backend.vercel.app/api/upload/json`
- ❌ URL incorreta: `https://disparodeemails-leads-frontend.vercel.app/disparodeemails-leads-backend.vercel.app/api/upload/json`

Se a URL estiver incorreta, verifique a variável `VITE_API_URL` na Vercel.

## 🔗 URLs Corretas

- **Backend:** `https://disparodeemails-leads-backend.vercel.app`
- **Frontend:** `https://disparodeemails-leads-frontend.vercel.app`
- **API Upload JSON:** `https://disparodeemails-leads-backend.vercel.app/api/upload/json`


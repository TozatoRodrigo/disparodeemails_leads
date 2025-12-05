# 🔍 Verificar Backend

## ❌ Erro: ERR_CONNECTION_REFUSED

Este erro significa que o **backend não está rodando**.

## ✅ Solução Rápida

### 1. Verificar se o backend está rodando

```bash
# Verificar se há processo na porta 3001
lsof -ti:3001
```

Se não retornar nada, o backend não está rodando.

### 2. Iniciar o Backend

**Terminal 1 - Backend:**
```bash
cd /Volumes/Projetos/Prospecçao/email-dispatcher-backend
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando na porta 3001
📡 Backend URL: http://localhost:3001
🌐 Frontend URL: http://localhost:3000
🔗 Make Webhook: https://hook.us2.make.com/...
```

### 3. Verificar se está funcionando

Abra no navegador: http://localhost:3001/health

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### 4. Testar no Frontend

Depois que o backend estiver rodando, tente novamente no frontend.

---

## 🚀 Scripts Auxiliares

Use os scripts criados:

**Backend:**
```bash
cd /Volumes/Projetos/Prospecçao
./start-backend.sh
```

**Frontend (em outro terminal):**
```bash
cd /Volumes/Projetos/Prospecçao
./start-frontend.sh
```

---

## ⚠️ Problemas Comuns

### Porta já em uso

Se a porta 3001 estiver ocupada:

```bash
# Matar processo na porta 3001
lsof -ti:3001 | xargs kill -9

# Ou mudar a porta no .env
PORT=3002
```

### Backend não inicia

Verifique:
1. Dependências instaladas: `npm install`
2. Arquivo `.env` existe
3. Node.js versão: `node --version` (deve ser >= 18)

---

## 📋 Checklist

- [ ] Backend rodando em http://localhost:3001
- [ ] `/health` retorna `{"status":"ok"}`
- [ ] Frontend configurado com `VITE_API_URL=http://localhost:3001`
- [ ] Ambos rodando simultaneamente


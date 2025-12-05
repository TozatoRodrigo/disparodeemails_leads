# 🔧 Solução: ERR_CONNECTION_REFUSED

## ❌ Problema

O erro `ERR_CONNECTION_REFUSED` significa que o **backend não está rodando**.

## ✅ Solução Imediata

### Passo 1: Iniciar o Backend

Abra um **novo terminal** e execute:

```bash
cd /Volumes/Projetos/Prospecçao/email-dispatcher-backend
npm run dev
```

Você deve ver esta mensagem:
```
🚀 Servidor rodando na porta 3001
📡 Backend URL: http://localhost:3001
🌐 Frontend URL: http://localhost:3000
🔗 Make Webhook: https://hook.us2.make.com/...
```

### Passo 2: Verificar se Funcionou

Abra no navegador: **http://localhost:3001/health**

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### Passo 3: Tentar Novamente no Frontend

Agora que o backend está rodando, volte ao frontend e tente enviar o JSON novamente.

---

## 🚀 Usando os Scripts (Mais Fácil)

### Terminal 1 - Backend:
```bash
cd /Volumes/Projetos/Prospecçao
./start-backend.sh
```

### Terminal 2 - Frontend:
```bash
cd /Volumes/Projetos/Prospecçao
./start-frontend.sh
```

---

## 📋 Checklist

- [ ] Backend iniciado e rodando
- [ ] Mensagem "🚀 Servidor rodando na porta 3001" aparece
- [ ] http://localhost:3001/health retorna OK
- [ ] Frontend ainda está rodando (em outro terminal)
- [ ] Tentar enviar JSON novamente

---

## ⚠️ Importante

**Você precisa ter 2 terminais abertos:**

1. **Terminal 1**: Backend (`npm run dev` no diretório `email-dispatcher-backend`)
2. **Terminal 2**: Frontend (`npm run dev` no diretório `email-dispatcher-frontend`)

Ambos devem estar rodando **simultaneamente**!

---

## 🔍 Verificar se Está Funcionando

### Backend:
```bash
curl http://localhost:3001/health
```

### Frontend:
Acesse: http://localhost:5173

---

## 💡 Dica

Se você fechar o terminal do backend, o frontend não conseguirá se conectar. Sempre mantenha ambos rodando!


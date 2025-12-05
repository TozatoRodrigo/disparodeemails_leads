# 🚀 Início Rápido - Email Dispatcher

## ⚡ Início Rápido (2 Terminais)

### Terminal 1 - Backend

```bash
cd /Volumes/Projetos/Prospecçao/email-dispatcher-backend
npm run dev
```

**Ou use o script:**
```bash
cd /Volumes/Projetos/Prospecçao
./start-backend.sh
```

### Terminal 2 - Frontend

```bash
cd /Volumes/Projetos/Prospecçao/email-dispatcher-frontend
npm run dev
```

**Ou use o script:**
```bash
cd /Volumes/Projetos/Prospecçao
./start-frontend.sh
```

---

## ✅ Verificar se Funcionou

- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:5173

---

## 🔧 Se Der Erro

### Erro: "cd: no such file or directory"

**Você já está no diretório!** Execute apenas:
```bash
npm run dev
```

### Erro: "Missing script: dev"

Verifique se está no diretório correto:
```bash
pwd
# Deve mostrar: .../email-dispatcher-backend ou .../email-dispatcher-frontend

ls package.json
# Deve mostrar o arquivo package.json
```

---

## 📋 Comandos Corretos

### Se você está em `/Volumes/Projetos/Prospecçao`:

**Backend:**
```bash
cd email-dispatcher-backend
npm run dev
```

**Frontend:**
```bash
cd email-dispatcher-frontend  
npm run dev
```

### Se você já está dentro do diretório:

**Apenas execute:**
```bash
npm run dev
```

---

## 🎯 Resumo

1. Abra **2 terminais**
2. Terminal 1: `cd email-dispatcher-backend && npm run dev`
3. Terminal 2: `cd email-dispatcher-frontend && npm run dev`
4. Acesse: http://localhost:5173


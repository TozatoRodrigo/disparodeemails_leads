# 🚀 Como Iniciar os Servidores

## ✅ Método 1: Scripts Auxiliares (Recomendado)

### Iniciar Backend

```bash
./start-backend.sh
```

### Iniciar Frontend (em outro terminal)

```bash
./start-frontend.sh
```

---

## ✅ Método 2: Comandos Manuais

### Terminal 1 - Backend

```bash
cd email-dispatcher-backend
npm run dev
```

O backend estará em: **http://localhost:3001**

### Terminal 2 - Frontend

```bash
cd email-dispatcher-frontend
npm run dev
```

O frontend estará em: **http://localhost:5173**

---

## 🔍 Verificar se Está Funcionando

### Backend
- Acesse: http://localhost:3001/health
- Deve retornar: `{"status":"ok","timestamp":"..."}`

### Frontend
- Acesse: http://localhost:5173
- Deve abrir a interface do Email Dispatcher

---

## ⚠️ Solução de Problemas

### Erro: "cd: no such file or directory"

**Solução:** Você já está no diretório correto. Execute apenas:
```bash
npm run dev
```

### Erro: "Missing script: dev"

**Solução:** Verifique se está no diretório correto:
```bash
pwd  # Deve mostrar: .../email-dispatcher-backend
ls package.json  # Deve mostrar o arquivo
```

### Erro: Porta já em uso

**Solução:** Pare o processo que está usando a porta:
```bash
# Para porta 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Para porta 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Ordem Recomendada

1. **Primeiro**: Inicie o backend
   ```bash
   cd email-dispatcher-backend
   npm run dev
   ```

2. **Depois**: Em outro terminal, inicie o frontend
   ```bash
   cd email-dispatcher-frontend
   npm run dev
   ```

3. **Acesse**: http://localhost:5173

---

## ✅ Checklist

- [ ] Backend rodando em http://localhost:3001
- [ ] Frontend rodando em http://localhost:5173
- [ ] Arquivo `.env` configurado no backend
- [ ] Arquivo `.env` configurado no frontend
- [ ] Dependências instaladas (`npm install`)


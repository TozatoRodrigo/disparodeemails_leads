# 📤 Configuração do Git e GitHub

## 🚀 Passos para Upload no GitHub

### 1. Inicializar Git (se ainda não feito)

```bash
cd /Volumes/Projetos/Prospecçao
git init
```

### 2. Adicionar Remote do GitHub

```bash
git remote add origin https://github.com/TozatoRodrigo/disparodeemails_leads.git
```

### 3. Adicionar Arquivos

```bash
# Verificar o que será commitado
git status

# Adicionar todos os arquivos (exceto os no .gitignore)
git add .

# Verificar o que será commitado
git status
```

### 4. Primeiro Commit

```bash
git commit -m "feat: sistema completo de disparo de emails via Make.com

- Backend Node.js/Express com SQLite
- Frontend React + TypeScript + Tailwind
- Integração com Make.com via webhook
- Upload CSV e colar JSON
- Sistema de status e histórico
- Configurado para deploy na Vercel"
```

### 5. Push para GitHub

```bash
# Primeira vez (criar branch main)
git branch -M main
git push -u origin main

# Próximas vezes
git push
```

## 📋 Checklist Antes do Commit

- [ ] `.env` não está no commit (verificar `.gitignore`)
- [ ] `node_modules/` não está no commit
- [ ] `database.sqlite` não está no commit
- [ ] Arquivos de build (`dist/`) não estão no commit
- [ ] Todos os arquivos importantes estão commitados

## 🔍 Verificar Arquivos Ignorados

```bash
git status --ignored
```

## 🔄 Comandos Úteis

### Ver mudanças
```bash
git status
git diff
```

### Adicionar arquivo específico
```bash
git add arquivo.js
```

### Desfazer mudanças não commitadas
```bash
git restore arquivo.js
git restore .
```

### Ver histórico
```bash
git log --oneline
```

## 🌿 Branches

### Criar branch para feature
```bash
git checkout -b feature/nome-da-feature
```

### Voltar para main
```bash
git checkout main
```

### Merge branch
```bash
git merge feature/nome-da-feature
```

## 📝 Estrutura Recomendada de Commits

Use mensagens descritivas:

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona testes
chore: tarefas de manutenção
```

## 🔐 Segurança

**NUNCA commite:**
- Arquivos `.env` com credenciais
- Chaves de API
- Senhas
- Tokens de acesso

Todos devem estar no `.gitignore`!


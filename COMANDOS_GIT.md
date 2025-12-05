# 📤 Comandos para Upload no GitHub

## ⚡ Comandos Rápidos (Copie e Cole)

```bash
cd /Volumes/Projetos/Prospecçao

# 1. Verificar estrutura
./PREPARAR_GITHUB.sh

# 2. Adicionar arquivos
git add .

# 3. Verificar o que será commitado
git status

# 4. Commit inicial
git commit -m "feat: sistema completo de disparo de emails via Make.com

- Backend Node.js/Express com SQLite
- Frontend React + TypeScript + Tailwind  
- Integração com Make.com via webhook
- Upload CSV e colar JSON
- Sistema de status e histórico
- Configurado para deploy na Vercel"

# 5. Adicionar remote (se ainda não feito)
git remote add origin https://github.com/TozatoRodrigo/disparodeemails_leads.git

# 6. Push para GitHub
git branch -M main
git push -u origin main
```

## ✅ Verificar Antes do Push

```bash
# Verificar arquivos que serão commitados
git status

# Verificar se .env está sendo ignorado
git check-ignore backend/.env frontend/.env

# Verificar estrutura
ls -la backend/ frontend/
```

## 🔄 Próximos Commits

```bash
# Adicionar mudanças
git add .

# Commit
git commit -m "descrição das mudanças"

# Push
git push
```

## 📋 Checklist Final

- [ ] `.env` não está no commit
- [ ] `node_modules/` não está no commit  
- [ ] `database.sqlite` não está no commit
- [ ] Estrutura `backend/` e `frontend/` está correta
- [ ] Arquivos de configuração estão presentes
- [ ] README.md está atualizado


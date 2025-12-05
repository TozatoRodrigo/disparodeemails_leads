#!/bin/bash

set -e  # Parar em caso de erro

echo "🚀 Automatizando upload para GitHub..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Verificar se .env existe e avisar
if [ -f "backend/.env" ] || [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: Arquivos .env encontrados!${NC}"
    echo "   Verificando se estão no .gitignore..."
    if git check-ignore backend/.env frontend/.env > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Arquivos .env estão sendo ignorados corretamente${NC}"
    else
        echo -e "${RED}   ❌ ERRO: Arquivos .env NÃO estão no .gitignore!${NC}"
        echo "   Adicionando ao .gitignore..."
        echo ".env" >> backend/.gitignore
        echo ".env" >> frontend/.gitignore
        echo -e "${GREEN}   ✅ Corrigido!${NC}"
    fi
    echo ""
fi

# Verificar se git está inicializado
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositório Git..."
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
    echo ""
fi

# Verificar remote
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin)
    echo "🔗 Remote já configurado: $REMOTE_URL"
else
    echo "🔗 Configurando remote do GitHub..."
    git remote add origin https://github.com/TozatoRodrigo/disparodeemails_leads.git
    echo -e "${GREEN}✅ Remote configurado${NC}"
fi
echo ""

# Adicionar arquivos
echo "📝 Adicionando arquivos ao Git..."
git add .
echo -e "${GREEN}✅ Arquivos adicionados${NC}"
echo ""

# Verificar se há mudanças para commitar
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  Nenhuma mudança para commitar${NC}"
    echo "   Verificando se já existe commit..."
    if git rev-parse --verify HEAD > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Já existe commit. Pronto para push!${NC}"
        echo ""
        echo "📤 Para fazer push, execute:"
        echo "   git push -u origin main"
        exit 0
    else
        echo -e "${RED}❌ Nenhum commit encontrado e nenhuma mudança para commitar${NC}"
        exit 1
    fi
fi

# Mostrar o que será commitado
echo "📋 Arquivos que serão commitados:"
git status --short | head -20
if [ $(git status --short | wc -l) -gt 20 ]; then
    echo "... e mais arquivos"
fi
echo ""

# Criar commit
echo "💾 Criando commit..."
git commit -m "feat: sistema completo de disparo de emails via Make.com

- Backend Node.js/Express com SQLite
- Frontend React + TypeScript + Tailwind
- Integração com Make.com via webhook
- Upload CSV e colar JSON
- Sistema de status e histórico
- Configurado para deploy na Vercel"
echo -e "${GREEN}✅ Commit criado${NC}"
echo ""

# Configurar branch main
echo "🌿 Configurando branch main..."
git branch -M main 2>/dev/null || echo "Branch já é main"
echo -e "${GREEN}✅ Branch configurada${NC}"
echo ""

# Verificar se já existe push
echo "📤 Preparando para push..."
echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: O próximo comando fará push para o GitHub${NC}"
echo ""
echo "Para continuar, execute manualmente:"
echo -e "${GREEN}   git push -u origin main${NC}"
echo ""
echo "Ou se preferir, eu posso fazer automaticamente. Deseja continuar? (s/N)"
read -r response
if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
    echo ""
    echo "🚀 Fazendo push para GitHub..."
    git push -u origin main
    echo ""
    echo -e "${GREEN}✅ Push concluído com sucesso!${NC}"
    echo ""
    echo "🎉 Próximos passos:"
    echo "   1. Acesse: https://github.com/TozatoRodrigo/disparodeemails_leads"
    echo "   2. Configure deploy na Vercel (veja DEPLOY.md)"
else
    echo ""
    echo "⏸️  Push cancelado. Execute manualmente quando estiver pronto:"
    echo -e "${GREEN}   git push -u origin main${NC}"
fi

echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"


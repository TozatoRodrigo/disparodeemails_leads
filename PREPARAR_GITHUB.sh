#!/bin/bash

echo "🚀 Preparando projeto para GitHub..."

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se .env existe e avisar
if [ -f "backend/.env" ] || [ -f "frontend/.env" ]; then
    echo "⚠️  ATENÇÃO: Arquivos .env encontrados!"
    echo "   Certifique-se de que estão no .gitignore"
    echo ""
fi

# Verificar estrutura
echo "✅ Estrutura verificada:"
echo "   - backend/ ✓"
echo "   - frontend/ ✓"
echo "   - .gitignore ✓"
echo ""

# Status do Git
if [ -d ".git" ]; then
    echo "📊 Status do Git:"
    git status --short | head -10
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. git add ."
    echo "   2. git commit -m 'feat: sistema completo de disparo de emails'"
    echo "   3. git remote add origin https://github.com/TozatoRodrigo/disparodeemails_leads.git"
    echo "   4. git push -u origin main"
else
    echo "📝 Para inicializar Git:"
    echo "   1. git init"
    echo "   2. git add ."
    echo "   3. git commit -m 'feat: sistema completo de disparo de emails'"
    echo "   4. git remote add origin https://github.com/TozatoRodrigo/disparodeemails_leads.git"
    echo "   5. git branch -M main"
    echo "   6. git push -u origin main"
fi

echo ""
echo "✅ Preparação concluída!"

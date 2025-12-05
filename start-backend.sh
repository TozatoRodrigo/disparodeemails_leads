#!/bin/bash

# Script para iniciar o backend
cd "$(dirname "$0")/email-dispatcher-backend"

echo "🚀 Iniciando backend..."
echo "📁 Diretório: $(pwd)"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não encontrado. Instalando dependências..."
    npm install
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando..."
    cat > .env << 'EOF'
PORT=3001
MAKE_WEBHOOK_URL=https://hook.us2.make.com/nsbgpncoedngvei9dve32shk2x7bau9j
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Arquivo .env criado"
fi

echo "✅ Iniciando servidor backend..."
npm run dev


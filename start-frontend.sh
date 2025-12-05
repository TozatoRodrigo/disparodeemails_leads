#!/bin/bash

# Script para iniciar o frontend
cd "$(dirname "$0")/email-dispatcher-frontend"

echo "🚀 Iniciando frontend..."
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
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "✅ Arquivo .env criado"
fi

echo "✅ Iniciando servidor frontend..."
npm run dev


#!/bin/bash

# Script de instalação com configurações para Node.js 24
echo "🔧 Configurando variáveis de ambiente para build..."

# Configurar C++20 para o node-gyp (apenas para C++)
export CXXFLAGS="-std=c++20"

# Limpar cache e node_modules anteriores
echo "🧹 Limpando instalações anteriores..."
rm -rf node_modules package-lock.json

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

echo "✅ Instalação concluída!"


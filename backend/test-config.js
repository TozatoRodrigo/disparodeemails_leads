#!/usr/bin/env node

/**
 * Script para testar a configuração do Make.com webhook
 */

import dotenv from 'dotenv';
import { enviarParaMake } from './src/services/makeService.js';

dotenv.config();

console.log('🔍 Verificando configuração...\n');

// Verificar variáveis de ambiente
const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
const backendUrl = process.env.BACKEND_URL;

console.log('📋 Variáveis de ambiente:');
console.log(`   MAKE_WEBHOOK_URL: ${makeWebhookUrl || '❌ NÃO CONFIGURADO'}`);
console.log(`   BACKEND_URL: ${backendUrl || '❌ NÃO CONFIGURADO'}`);
console.log(`   PORT: ${process.env.PORT || '3001 (padrão)'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000 (padrão)'}\n`);

if (!makeWebhookUrl) {
  console.error('❌ Erro: MAKE_WEBHOOK_URL não está configurado no .env');
  process.exit(1);
}

if (!backendUrl) {
  console.error('❌ Erro: BACKEND_URL não está configurado no .env');
  process.exit(1);
}

// Testar envio para Make.com
console.log('🧪 Testando conexão com Make.com...\n');

const testBatchId = 'test-' + Date.now();
const testLeads = [
  {
    nome: 'Teste Automatizado',
    email: 'teste@example.com',
    empresa: 'Teste Empresa'
  }
];
const callbackUrl = `${backendUrl}/api/webhook/resultado`;

console.log('📤 Enviando dados de teste:');
console.log(`   Batch ID: ${testBatchId}`);
console.log(`   Leads: ${testLeads.length}`);
console.log(`   Callback URL: ${callbackUrl}\n`);

try {
  const result = await enviarParaMake(testBatchId, testLeads, callbackUrl);
  
  if (result.success) {
    console.log('✅ Teste bem-sucedido!');
    console.log('   O webhook do Make.com está configurado corretamente.\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Configure o cenário no Make.com seguindo MAKE_WEBHOOK_SETUP.md');
    console.log('   2. O cenário deve processar os leads e enviar callbacks para:');
    console.log(`      ${callbackUrl}`);
    console.log('   3. Faça upload de um CSV via POST /api/upload');
  } else {
    console.error('❌ Erro ao enviar para Make.com:');
    console.error(`   ${result.error}\n`);
    console.log('💡 Verifique:');
    console.log('   - Se a URL do webhook está correta');
    console.log('   - Se o webhook está ativo no Make.com');
    console.log('   - Se há conexão com a internet');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erro inesperado:', error.message);
  process.exit(1);
}


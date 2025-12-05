/**
 * Envia dados do batch para o webhook do Make.com
 * @param {string} batchId - ID único do batch
 * @param {Array} leads - Array de leads para envio
 * @param {string} callbackUrl - URL para callback de resultados
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function enviarParaMake(batchId, leads, callbackUrl) {
  try {
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    console.log('🔍 Verificando configuração Make.com...');
    console.log('   MAKE_WEBHOOK_URL:', makeWebhookUrl ? '✅ Configurado' : '❌ NÃO CONFIGURADO');
    console.log('   BACKEND_URL:', process.env.BACKEND_URL || '❌ NÃO CONFIGURADO');
    
    if (!makeWebhookUrl) {
      throw new Error('MAKE_WEBHOOK_URL não configurada. Configure na Vercel: Settings → Environment Variables');
    }

    const payload = {
      batchId,
      leads,
      callbackUrl,
      timestamp: new Date().toISOString()
    };

    console.log('📨 Enviando para Make.com:');
    console.log('   URL:', makeWebhookUrl);
    console.log('   Batch ID:', batchId);
    console.log('   Total de leads:', leads.length);
    console.log('   Callback URL:', callbackUrl);
    console.log('   Payload (primeiros 2 leads):', JSON.stringify({
      ...payload,
      leads: leads.slice(0, 2) // Mostrar apenas os 2 primeiros para não poluir o log
    }, null, 2));

    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Email-Dispatcher-Backend/1.0'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📥 Resposta do Make.com:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Body:', responseText.substring(0, 500)); // Primeiros 500 chars

    if (!response.ok) {
      throw new Error(`Erro ao enviar para Make.com: ${response.status} - ${responseText}`);
    }

    console.log('✅ Dados enviados com sucesso para Make.com');
    return { success: true, response: responseText };
  } catch (error) {
    console.error('❌ Erro ao enviar para Make.com:');
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    return { success: false, error: error.message };
  }
}


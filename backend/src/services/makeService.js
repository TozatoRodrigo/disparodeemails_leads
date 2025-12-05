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
    
    if (!makeWebhookUrl) {
      throw new Error('MAKE_WEBHOOK_URL não configurada no .env');
    }

    const payload = {
      batchId,
      leads,
      callbackUrl,
      timestamp: new Date().toISOString()
    };

    console.log('📨 Enviando para Make.com:', { batchId, totalLeads: leads.length });

    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao enviar para Make.com: ${response.status} - ${errorText}`);
    }

    console.log('✅ Dados enviados com sucesso para Make.com');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar para Make.com:', error.message);
    return { success: false, error: error.message };
  }
}


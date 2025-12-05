import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

// POST /api/webhook/resultado
// Este endpoint NÃO requer autenticação - é chamado pelo Make.com
router.post('/resultado', async (req, res) => {
  try {
    const { batchId, email, success, error } = req.body;

    if (!batchId || !email) {
      console.log('❌ Callback inválido - campos faltando:', { batchId, email });
      return res.status(400).json({
        received: false,
        message: 'batchId e email são obrigatórios'
      });
    }

    // Normalizar email para lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('📨 Callback recebido:');
    console.log('   Batch ID:', batchId);
    console.log('   Email:', normalizedEmail);
    console.log('   Success:', success);
    console.log('   Error:', error || 'N/A');

    // Verificar se o batch existe
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.log('⚠️ Batch não encontrado:', batchId);
      return res.json({ received: true, warning: 'Batch não encontrado' });
    }

    // Atualizar status do lead
    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: success ? 'sent' : 'error',
        error_message: success ? null : (error || 'Erro desconhecido'),
        sent_at: success ? new Date().toISOString() : null
      })
      .eq('batch_id', batchId)
      .ilike('email', normalizedEmail)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar lead:', updateError);
    } else {
      console.log('   ✅ Lead atualizado:', updatedLead?.length || 0, 'registros');
    }

    // Buscar estatísticas atualizadas
    const { data: allLeads } = await supabaseAdmin
      .from('leads')
      .select('status')
      .eq('batch_id', batchId);

    const total = allLeads?.length || 0;
    const enviados = allLeads?.filter(l => l.status === 'sent').length || 0;
    const erros = allLeads?.filter(l => l.status === 'error').length || 0;
    const pendentes = allLeads?.filter(l => l.status === 'pending').length || 0;

    console.log('📊 Status do batch:', { total, enviados, erros, pendentes });

    // Se todos foram processados, atualizar batch para completed
    if (pendentes === 0 && total > 0) {
      // Buscar detalhes dos erros
      const { data: errosData } = await supabaseAdmin
        .from('leads')
        .select('email, error_message')
        .eq('batch_id', batchId)
        .eq('status', 'error');

      const errosArray = (errosData || []).map(e => ({
        email: e.email,
        error: e.error_message
      }));

      const { error: updateBatchError } = await supabaseAdmin
        .from('batches')
        .update({
          status: 'completed',
          sucessos: enviados,
          erros: errosArray
        })
        .eq('id', batchId);

      if (updateBatchError) {
        console.error('❌ Erro ao atualizar batch:', updateBatchError);
      } else {
        console.log('🎉 Batch concluído:', batchId, '- Enviados:', enviados, '- Erros:', erros);
      }
    } else {
      console.log('⏳ Batch em progresso:', batchId, '- Pendentes:', pendentes);
    }

    res.json({
      received: true,
      stats: { total, enviados, erros, pendentes }
    });
  } catch (error) {
    console.error('❌ Erro ao processar callback:', error);
    res.status(500).json({
      received: false,
      message: 'Erro ao processar callback'
    });
  }
});

export default router;

import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// POST /api/webhook/resultado
router.post('/resultado', (req, res) => {
  try {
    const { batchId, email, success, error } = req.body;

    if (!batchId || !email) {
      console.log('❌ Callback inválido - campos faltando:', { batchId, email });
      return res.status(400).json({
        received: false,
        message: 'batchId e email são obrigatórios'
      });
    }

    // Normalizar email para lowercase (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('📨 Callback recebido:');
    console.log('   Batch ID:', batchId);
    console.log('   Email original:', email);
    console.log('   Email normalizado:', normalizedEmail);
    console.log('   Success:', success);
    console.log('   Error:', error || 'N/A');

    // Verificar se o lead existe
    const existingLead = db.prepare(`
      SELECT id, email, status FROM leads 
      WHERE batch_id = ? AND LOWER(email) = ?
    `).get(batchId, normalizedEmail);

    if (!existingLead) {
      console.log('⚠️ Lead não encontrado no banco:', { batchId, email: normalizedEmail });
      // Listar leads do batch para debug
      const allLeads = db.prepare('SELECT email FROM leads WHERE batch_id = ?').all(batchId);
      console.log('   Leads no batch:', allLeads.map(l => l.email));
      return res.json({ received: true, warning: 'Lead não encontrado, mas callback aceito' });
    }

    console.log('   Lead encontrado:', existingLead);

    // Atualizar status do lead (usando LOWER para case-insensitive)
    const updateLead = db.prepare(`
      UPDATE leads 
      SET status = ?, 
          error_message = ?,
          sent_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE sent_at END
      WHERE batch_id = ? AND LOWER(email) = ?
    `);

    if (success) {
      const result = updateLead.run('sent', null, 1, batchId, normalizedEmail);
      console.log('   ✅ Lead atualizado para SENT:', result.changes, 'linhas');
    } else {
      const result = updateLead.run('error', error || 'Erro desconhecido', 0, batchId, normalizedEmail);
      console.log('   ❌ Lead atualizado para ERROR:', result.changes, 'linhas');
    }

    // Verificar se todos os leads foram processados
    const leadsStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as enviados,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as erros,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes
      FROM leads 
      WHERE batch_id = ?
    `).get(batchId);

    console.log('📊 Status do batch:', leadsStats);

    const totalProcessados = leadsStats.enviados + leadsStats.erros;

    // Se todos foram processados, atualizar batch para completed
    if (totalProcessados >= leadsStats.total) {
      const errosArray = db.prepare(`
        SELECT email, error_message 
        FROM leads 
        WHERE batch_id = ? AND status = 'error'
      `).all(batchId);

      const errosJson = JSON.stringify(errosArray.map(e => ({
        email: e.email,
        error: e.error_message
      })));

      const updateBatch = db.prepare(`
        UPDATE batches 
        SET status = 'completed',
            sucessos = ?,
            erros = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      updateBatch.run(leadsStats.enviados, errosJson, batchId);
      console.log('🎉 Batch concluído:', batchId, '- Enviados:', leadsStats.enviados, '- Erros:', leadsStats.erros);
    } else {
      console.log('⏳ Batch em progresso:', batchId, '- Processados:', totalProcessados, '/', leadsStats.total);
    }

    res.json({ 
      received: true,
      stats: leadsStats
    });
  } catch (error) {
    console.error('❌ Erro ao processar callback:', error.message);
    res.status(500).json({
      received: false,
      message: 'Erro ao processar callback'
    });
  }
});

export default router;


import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// POST /api/webhook/resultado
router.post('/resultado', (req, res) => {
  try {
    const { batchId, email, success, error } = req.body;

    if (!batchId || !email) {
      return res.status(400).json({
        received: false,
        message: 'batchId e email são obrigatórios'
      });
    }

    console.log('📨 Callback recebido:', { batchId, email, success });

    // Atualizar status do lead
    const updateLead = db.prepare(`
      UPDATE leads 
      SET status = ?, 
          error_message = ?,
          sent_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE sent_at END
      WHERE batch_id = ? AND email = ?
    `);

    if (success) {
      updateLead.run('sent', null, 1, batchId, email);
    } else {
      updateLead.run('error', error || 'Erro desconhecido', 0, batchId, email);
    }

    // Verificar se todos os leads foram processados
    const leadsStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as enviados,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as erros
      FROM leads 
      WHERE batch_id = ?
    `).get(batchId);

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
      console.log('✅ Batch concluído:', batchId);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro ao processar callback:', error.message);
    res.status(500).json({
      received: false,
      message: 'Erro ao processar callback'
    });
  }
});

export default router;


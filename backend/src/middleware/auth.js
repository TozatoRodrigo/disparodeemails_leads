import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Middleware que requer autenticação
 * Verifica o token JWT do Supabase e adiciona o usuário ao request
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ Token inválido:', error?.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Erro de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno de autenticação'
    });
  }
}

/**
 * Middleware opcional de autenticação
 * Permite acesso sem auth, mas identifica se o usuário está logado
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      req.user = user || null;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL não configurada');
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY não configurada');
}

// Cliente com service role (full access - usar apenas no backend)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente com anon key (para verificar tokens)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export default supabaseAdmin;


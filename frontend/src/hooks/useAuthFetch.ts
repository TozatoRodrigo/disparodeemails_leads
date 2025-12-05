import { supabase } from '@/lib/supabase';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Função para fazer chamadas de API com autenticação
 */
export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Se não precisa de auth, faz chamada normal
  if (skipAuth) {
    return fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
  }

  // Obter sessão atual
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Usuário não autenticado');
  }

  // Fazer chamada com token
  return fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...fetchOptions.headers,
    },
  });
}

/**
 * Hook para usar em componentes React
 */
export function useAuthFetch() {
  return { authFetch };
}

export default authFetch;


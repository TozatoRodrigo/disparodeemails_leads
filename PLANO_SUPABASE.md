# 🚀 Plano de Implementação - Supabase Integration

## 📋 Visão Geral

Migrar o sistema Email Dispatcher para usar **Supabase** como:
- **Autenticação**: Login/registro de usuários
- **Banco de Dados**: PostgreSQL substituindo SQLite
- **Storage** (opcional): Armazenamento de arquivos CSV

---

## 🎯 Benefícios da Migração

| Atual (SQLite) | Com Supabase |
|----------------|--------------|
| Dados perdem na Vercel (ephemeral) | Dados persistentes |
| Sem autenticação | Login/Logout seguro |
| Single user | Multi-tenant (múltiplos usuários) |
| Sem histórico real | Histórico permanente |

---

## 📅 Fases de Implementação

### Fase 1: Configuração do Supabase (30 min)
### Fase 2: Banco de Dados (1h)
### Fase 3: Autenticação Backend (1h)
### Fase 4: Autenticação Frontend (2h)
### Fase 5: Migração de Rotas (1h)
### Fase 6: Testes e Deploy (1h)

**Tempo total estimado: 6-7 horas**

---

## 📦 Fase 1: Configuração do Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `email-dispatcher`
   - **Database Password**: (guarde em local seguro!)
   - **Region**: `South America (São Paulo)` ou mais próximo
4. Aguarde a criação (~2 min)

### 1.2 Obter Credenciais

No dashboard do Supabase, vá em **Settings > API**:

```env
# Copie esses valores para .env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6... (para backend)
```

### 1.3 Configurar Variáveis de Ambiente

**Backend (.env e Vercel):**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Frontend (.env e Vercel):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 🗄️ Fase 2: Banco de Dados

### 2.1 Criar Tabelas no Supabase

No **SQL Editor** do Supabase, execute:

```sql
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário (extensão do auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de batches (vinculada ao usuário)
CREATE TABLE public.batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  total_leads INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  sucessos INTEGER DEFAULT 0,
  erros JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de leads
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  empresa TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_batches_user_id ON public.batches(user_id);
CREATE INDEX idx_batches_status ON public.batches(status);
CREATE INDEX idx_leads_batch_id ON public.leads(batch_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_email ON public.leads(email);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2.2 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para batches
CREATE POLICY "Users can view own batches"
  ON public.batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own batches"
  ON public.batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own batches"
  ON public.batches FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para leads (via batch)
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.batches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads in own batches"
  ON public.leads FOR INSERT
  WITH CHECK (
    batch_id IN (
      SELECT id FROM public.batches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (
    batch_id IN (
      SELECT id FROM public.batches WHERE user_id = auth.uid()
    )
  );

-- Política especial para webhook (service role)
-- O webhook usa service_key, então não precisa de política
```

### 2.3 Criar Trigger para Profile Automático

```sql
-- Criar profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🔐 Fase 3: Autenticação Backend

### 3.1 Instalar Dependências

```bash
cd backend
npm install @supabase/supabase-js
```

### 3.2 Criar Cliente Supabase

**Criar arquivo: `backend/src/lib/supabase.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not configured');
}

// Cliente com service role (full access - usar apenas no backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente para verificar tokens de usuário
export const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);

export default supabaseAdmin;
```

### 3.3 Criar Middleware de Autenticação

**Criar arquivo: `backend/src/middleware/auth.js`**

```javascript
import { supabaseAdmin } from '../lib/supabase.js';

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

// Middleware opcional (permite acesso sem auth, mas identifica se logado)
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
```

### 3.4 Atualizar Rotas com Supabase

**Atualizar: `backend/src/routes/upload.js`**

```javascript
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { enviarParaMake } from '../services/makeService.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(requireAuth);

// POST /api/upload/json
router.post('/json', async (req, res) => {
  try {
    const { leads } = req.body;
    const userId = req.user.id;
    
    // ... validação de leads ...
    
    const batchId = uuidv4();
    
    // Inserir batch no Supabase
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .insert({
        id: batchId,
        user_id: userId,
        filename: 'json-upload',
        total_leads: leads.length,
        status: 'processing'
      })
      .select()
      .single();
    
    if (batchError) throw batchError;
    
    // Inserir leads
    const leadsToInsert = leads.map(lead => ({
      batch_id: batchId,
      nome: lead.nome,
      email: lead.email.toLowerCase(),
      empresa: lead.empresa || null,
      status: 'pending'
    }));
    
    const { error: leadsError } = await supabaseAdmin
      .from('leads')
      .insert(leadsToInsert);
    
    if (leadsError) throw leadsError;
    
    // Enviar para Make.com
    const callbackUrl = `${process.env.BACKEND_URL}/api/webhook/resultado`;
    enviarParaMake(batchId, leads, callbackUrl);
    
    res.json({
      success: true,
      batchId,
      totalLeads: leads.length,
      message: 'Processamento iniciado'
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/upload/status/:batchId
router.get('/status/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user.id;
    
    const { data: batch, error } = await supabaseAdmin
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();
    
    if (error || !batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch não encontrado'
      });
    }
    
    res.json({
      id: batch.id,
      filename: batch.filename,
      totalLeads: batch.total_leads,
      status: batch.status,
      sucessos: batch.sucessos,
      erros: batch.erros,
      createdAt: batch.created_at,
      updatedAt: batch.updated_at
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/upload/history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: batches, error } = await supabaseAdmin
      .from('batches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json(batches.map(batch => ({
      id: batch.id,
      filename: batch.filename,
      totalLeads: batch.total_leads,
      status: batch.status,
      sucessos: batch.sucessos,
      erros: typeof batch.erros === 'string' ? JSON.parse(batch.erros).length : batch.erros?.length || 0,
      createdAt: batch.created_at
    })));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

### 3.5 Atualizar Webhook (sem auth - usa service key)

**Atualizar: `backend/src/routes/webhook.js`**

```javascript
import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = express.Router();

// POST /api/webhook/resultado (sem auth - chamado pelo Make.com)
router.post('/resultado', async (req, res) => {
  try {
    const { batchId, email, success, error } = req.body;
    
    if (!batchId || !email) {
      return res.status(400).json({
        received: false,
        message: 'batchId e email são obrigatórios'
      });
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('📨 Callback recebido:', { batchId, email: normalizedEmail, success });
    
    // Atualizar lead
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: success ? 'sent' : 'error',
        error_message: success ? null : (error || 'Erro desconhecido'),
        sent_at: success ? new Date().toISOString() : null
      })
      .eq('batch_id', batchId)
      .ilike('email', normalizedEmail);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar lead:', updateError);
    }
    
    // Verificar se todos os leads foram processados
    const { data: stats } = await supabaseAdmin
      .from('leads')
      .select('status')
      .eq('batch_id', batchId);
    
    const total = stats?.length || 0;
    const enviados = stats?.filter(l => l.status === 'sent').length || 0;
    const erros = stats?.filter(l => l.status === 'error').length || 0;
    const processados = enviados + erros;
    
    // Se todos processados, atualizar batch
    if (processados >= total) {
      // Buscar detalhes dos erros
      const { data: errosData } = await supabaseAdmin
        .from('leads')
        .select('email, error_message')
        .eq('batch_id', batchId)
        .eq('status', 'error');
      
      await supabaseAdmin
        .from('batches')
        .update({
          status: 'completed',
          sucessos: enviados,
          erros: errosData || []
        })
        .eq('id', batchId);
      
      console.log('🎉 Batch concluído:', batchId);
    }
    
    res.json({
      received: true,
      stats: { total, enviados, erros, processados }
    });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({
      received: false,
      message: error.message
    });
  }
});

export default router;
```

---

## 🎨 Fase 4: Autenticação Frontend

### 4.1 Instalar Dependências

```bash
cd frontend
npm install @supabase/supabase-js
```

### 4.2 Criar Cliente Supabase

**Criar arquivo: `frontend/src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

### 4.3 Criar Context de Autenticação

**Criar arquivo: `frontend/src/contexts/AuthContext.tsx`**

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 4.4 Criar Componentes de Login/Registro

**Criar arquivo: `frontend/src/components/auth/LoginForm.tsx`**

```typescript
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface LoginFormProps {
  onToggle: () => void;
}

export default function LoginForm({ onToggle }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email ou senha incorretos' 
        : error.message);
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta do Email Dispatcher
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Não tem uma conta?{' '}
            <button
              onClick={onToggle}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Criar conta
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Criar arquivo: `frontend/src/components/auth/RegisterForm.tsx`**

```typescript
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface RegisterFormProps {
  onToggle: () => void;
}

export default function RegisterForm({ onToggle }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-semibold text-zinc-100">Conta criada!</h3>
            <p className="text-zinc-400">
              Verifique seu email para confirmar a conta.
            </p>
            <Button onClick={onToggle} variant="outline" className="mt-4">
              Voltar para Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription>
          Registre-se para usar o Email Dispatcher
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Seu nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Já tem uma conta?{' '}
            <button
              onClick={onToggle}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Entrar
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.5 Criar Página de Auth

**Criar arquivo: `frontend/src/components/auth/AuthPage.tsx`**

```typescript
import { useState } from 'react';
import { Mail } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Particles } from '../magicui/particles';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={80}
        color="#ff6b35"
        refresh={false}
      />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Email Dispatcher</h1>
          <p className="text-zinc-400 mt-2">Sistema de disparo de emails via Make.com</p>
        </div>

        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
```

### 4.6 Atualizar App.tsx

```typescript
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
// ... outros imports

function AppContent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }
  
  if (!user) {
    return <AuthPage />;
  }

  // ... resto do app (sidebar, etc)
  // Adicionar botão de logout no sidebar
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

### 4.7 Atualizar Chamadas de API

Adicionar token de autenticação em todas as chamadas:

```typescript
// Em cada componente que faz chamada de API
import { supabase } from '../lib/supabase';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    }
  });
};

// Uso:
const response = await fetchWithAuth(`${apiUrl}/api/upload/json`, {
  method: 'POST',
  body: JSON.stringify({ leads })
});
```

---

## 🧪 Fase 5: Testes

### 5.1 Testar Localmente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5.2 Checklist de Testes

- [ ] Registro de novo usuário
- [ ] Login de usuário existente
- [ ] Logout
- [ ] Upload de JSON (autenticado)
- [ ] Status do batch mostra corretamente
- [ ] Histórico mostra apenas batches do usuário
- [ ] Callback do Make.com atualiza status

---

## 🚀 Fase 6: Deploy

### 6.1 Adicionar Variáveis na Vercel

**Backend:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Frontend:**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_API_URL=https://disparodeemails-leads-backend.vercel.app
```

### 6.2 Configurar Auth no Supabase

1. **Authentication > URL Configuration:**
   - Site URL: `https://disparodeemails-leads-frontend.vercel.app`
   - Redirect URLs: `https://disparodeemails-leads-frontend.vercel.app/**`

2. **Email Templates** (opcional):
   - Personalizar emails de confirmação e reset de senha

---

## 📊 Estrutura Final

```
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.js          # Cliente Supabase
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware de auth
│   │   ├── routes/
│   │   │   ├── upload.js            # Rotas protegidas
│   │   │   └── webhook.js           # Webhook (sem auth)
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.ts          # Cliente Supabase
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # Context de auth
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthPage.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   └── package.json
│
└── supabase/
    └── schema.sql                   # Schema do banco
```

---

## ✅ Resumo das Tarefas

| Fase | Tarefa | Tempo |
|------|--------|-------|
| 1 | Criar projeto Supabase e obter credenciais | 30 min |
| 2 | Criar tabelas e políticas RLS | 1h |
| 3 | Implementar auth no backend | 1h |
| 4 | Implementar auth no frontend | 2h |
| 5 | Testes locais | 1h |
| 6 | Deploy e configuração | 1h |

**Total: ~6-7 horas**

---

## 🎯 Próximos Passos

Quer que eu comece a implementação? Posso começar por:

1. **Opção A**: Criar o projeto no Supabase (você precisa fazer isso manualmente)
2. **Opção B**: Preparar o código do backend para Supabase
3. **Opção C**: Preparar o código do frontend para Supabase

Me diz qual prefere! 🚀


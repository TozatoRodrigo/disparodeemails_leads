-- =====================================================
-- SCHEMA DO BANCO DE DADOS - EMAIL DISPATCHER
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: profiles (extensão do auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: batches
-- =====================================================
CREATE TABLE IF NOT EXISTS public.batches (
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

-- =====================================================
-- TABELA: leads
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leads (
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

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_batches_user_id ON public.batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON public.batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_batch_id ON public.leads(batch_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- =====================================================
-- TRIGGER: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS batches_updated_at ON public.batches;
CREATE TRIGGER batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TRIGGER: Criar profile automaticamente
-- =====================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can insert own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can update own batches" ON public.batches;
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Service role full access batches" ON public.batches;
DROP POLICY IF EXISTS "Service role full access leads" ON public.leads;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- BATCHES
CREATE POLICY "Users can view own batches"
  ON public.batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own batches"
  ON public.batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own batches"
  ON public.batches FOR UPDATE
  USING (auth.uid() = user_id);

-- LEADS (via batch ownership)
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (
    batch_id IN (
      SELECT id FROM public.batches WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads"
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

-- =====================================================
-- DONE!
-- =====================================================
-- Após executar este SQL:
-- 1. Vá em Authentication > URL Configuration
-- 2. Configure Site URL: https://disparodeemails-leads-frontend.vercel.app
-- 3. Configure Redirect URLs: https://disparodeemails-leads-frontend.vercel.app/**
-- =====================================================


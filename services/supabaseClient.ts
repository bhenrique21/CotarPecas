import { createClient } from '@supabase/supabase-js';

// URL de placeholder que indica que o projeto ainda não foi configurado corretamente
const PLACEHOLDER_URL = 'https://sua-url-do-projeto.supabase.co';

// Tenta pegar do ambiente ou usa o placeholder/chave fornecida
const SUPABASE_URL = process.env.SUPABASE_URL || PLACEHOLDER_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_uodFO6lMYtro14R9E1epsg_PmVCNZLR';

// Flag para identificar se estamos rodando com Supabase real ou Mock local
export const isSupabaseConfigured = SUPABASE_URL !== PLACEHOLDER_URL && !SUPABASE_URL.includes('sua-url-do-projeto');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
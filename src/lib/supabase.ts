import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificação de segurança para não travar a tela branca
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas!')
  console.error('Verifique se o arquivo .env existe e se as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão preenchidas.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)
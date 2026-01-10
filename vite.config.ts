
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de arquivos .env locais, se houver
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Prioridade: process.env (Vercel/System) > env (Arquivo .env)
  // Isso garante que variáveis definidas na interface da Vercel sejam pegas corretamente
  const apiKey = process.env.API_KEY || env.API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

  // Log de build para debug (aparecerá nos logs de build da Vercel)
  console.log(`Build config: API_KEY está definida? ${!!apiKey ? 'SIM' : 'NÃO'}`);

  return {
    plugins: [react()],
    define: {
      // Define explicitamente as variáveis globais para substituição no código cliente
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    }
  }
})

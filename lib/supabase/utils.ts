/**
 * Verifica si las variables de entorno de Supabase están configuradas
 */
export const hasSupabaseEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

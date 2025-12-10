import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para uso en el navegador (Client Components)
 * Este cliente maneja automáticamente las cookies y la sesión del usuario
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

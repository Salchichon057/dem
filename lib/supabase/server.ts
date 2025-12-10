import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para uso en el servidor (Server Components, API Routes)
 * IMPORTANTE: No poner este cliente en una variable global.
 * Siempre crear un nuevo cliente dentro de cada función cuando se use.
 * Esto es especialmente importante si se usa Fluid compute.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // El método `setAll` fue llamado desde un Server Component.
            // Esto se puede ignorar si tienes middleware refrescando
            // las sesiones de usuario.
          }
        },
      },
    },
  );
}

/**
 * Cliente de Supabase con SERVICE ROLE KEY (bypasses RLS)
 * ⚠️ USAR SOLO EN API ROUTES DEL SERVIDOR
 * Esta función crea un cliente con permisos de administrador que ignora las políticas RLS.
 * NUNCA exponer este cliente al navegador.
 */
export async function createServiceClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key - bypasses RLS
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorar errores de cookies en Server Components
          }
        },
      },
    },
  );
}

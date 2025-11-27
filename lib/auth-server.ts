import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

/**
 * Obtiene el usuario autenticado actual desde Supabase
 * @returns Usuario autenticado o null si no hay sesión
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch {
    return null
  }
}

/**
 * Middleware de autenticación para API routes
 * Verifica que el usuario esté autenticado y retorna el cliente de Supabase y el usuario
 * @returns Objeto con supabase client y user, o NextResponse 401 si no está autenticado
 */
export async function withAuth() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      supabase: null,
      user: null,
      error: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return {
    supabase,
    user,
    error: null
  }
}


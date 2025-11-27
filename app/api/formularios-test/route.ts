import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

// Ruta de prueba para verificar conexión a Supabase
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const { error: authError } = await withAuth()
    if (authError) return authError

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // Información de debug
    const debug = {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0,
      serviceKeyStart: supabaseServiceKey?.substring(0, 20) + '...',
      url: supabaseUrl
    }
    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test 1: Consulta simple
    const { data: test1, error: error1 } = await supabase
      .from('form_templates')
      .select('id, name')
      .limit(1)
    // Test 2: Query con RPC (bypass RLS)
    const { data: test2, error: error2 } = await supabase.rpc('get_forms_by_section', {
      p_section_location: 'organizaciones'
    }).limit(1)
    return NextResponse.json({
      message: 'Tests completados',
      debug,
      tests: {
        select: {
          success: !error1,
          error: error1?.message,
          data: test1
        },
        rpc: {
          success: !error2,
          error: error2?.message,
          data: test2
        }
      }
    })

  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({
      error: 'Error en test',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

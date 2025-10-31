import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente con ANON key únicamente
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Log de configuración
console.log('🔧 [API] Supabase configurado:', {
  url: supabaseUrl?.substring(0, 30) + '...',
  usingAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length
})

 
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    console.log('🔍 [API] Obteniendo formulario:', id)
    console.log('🔍 [API] Usuario autenticado:', { userId: user.id, email: user.email })

    // SOLUCIÓN: Hacer TODO desde form_templates con JOIN para evitar permisos de form_sections
    console.log('🔍 [API] Intentando query con JOIN desde form_templates...')
    const { data: formWithSections, error: formError } = await supabase
      .from('form_templates')
      .select(`
        id,
        name,
        description,
        slug,
        is_public,
        is_active,
        section_location,
        version,
        created_by,
        created_at,
        updated_at,
        form_sections (
          id,
          title,
          description,
          order_index,
          form_template_id,
          questions (
            id,
            form_template_id,
            section_id,
            question_type_id,
            title,
            help_text,
            is_required,
            order_index,
            config,
            created_at,
            updated_at,
            question_types (
              id,
              code,
              name,
              description
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    console.log('� [API] Query result:', { 
      found: !!formWithSections, 
      error: formError,
      formData: formWithSections ? { 
        id: formWithSections.id, 
        name: formWithSections.name, 
        is_active: formWithSections.is_active,
        sectionsCount: formWithSections.form_sections?.length || 0
      } : null
    })

    if (formError || !formWithSections) {
      console.error('❌ [API] Error al obtener formulario:', {
        error: formError,
        errorCode: formError?.code,
        errorMessage: formError?.message,
        id: id
      })
      return NextResponse.json(
        { error: 'Formulario no encontrado', details: formError?.message },
        { status: 404 }
      )
    }

    console.log('✅ [API] Formulario completo obtenido:', {
      id: formWithSections.id,
      name: formWithSections.name,
      sections: formWithSections.form_sections?.length || 0
    })

    // Transformar al formato esperado
    const sections = formWithSections.form_sections || []
    
    // Aplanar todas las preguntas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allQuestions = sections.flatMap((section: any) => 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (section.questions || []).map((q: any) => ({
        ...q,
        section_id: section.id
      }))
    )

    // Devolver en el formato esperado por FormTemplateWithQuestions
    const response = {
      id: formWithSections.id,
      slug: formWithSections.slug,
      name: formWithSections.name,
      description: formWithSections.description,
      version: formWithSections.version,
      is_active: formWithSections.is_active,
      is_public: formWithSections.is_public,
      created_by: formWithSections.created_by,
      created_at: formWithSections.created_at,
      updated_at: formWithSections.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sections: sections.map((section: any) => ({
        id: section.id,
        form_template_id: section.form_template_id,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        created_at: section.created_at,
        questions: section.questions || []
      })),
      questions: allQuestions
    }

    console.log('✅ [API] Response preparado:', {
      id: response.id,
      name: response.name,
      totalSections: response.sections.length,
      totalQuestions: response.questions.length
    })

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (err: unknown) {
    const error = err as Error
    console.error('❌ [API] Error en GET /api/formularios/[id]:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

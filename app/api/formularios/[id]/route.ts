import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
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

    console.log('🔍 Obteniendo formulario:', id)

    // Obtener formulario
    const { data: form, error: formError } = await supabase
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
        updated_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (formError || !form) {
      console.error('❌ Error al obtener formulario:', formError)
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener secciones
    const { data: sections, error: sectionsError } = await supabase
      .from('form_sections')
      .select('id, title, description, order_index, form_template_id')
      .eq('form_template_id', id)
      .order('order_index', { ascending: true })

    if (sectionsError) {
      console.error('❌ Error al obtener secciones:', sectionsError)
      return NextResponse.json(
        { error: 'Error al obtener secciones' },
        { status: 500 }
      )
    }

    // Obtener preguntas con sus tipos
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
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
      `)
      .eq('form_template_id', id)
      .order('order_index', { ascending: true })

    if (questionsError) {
      console.error('❌ Error al obtener preguntas:', questionsError)
      return NextResponse.json(
        { error: 'Error al obtener preguntas' },
        { status: 500 }
      )
    }

    // Organizar preguntas por sección
    const sectionsWithQuestions = sections?.map(section => ({
      ...section,
      questions: questions?.filter(q => q.section_id === section.id) || []
    })) || []

    console.log('✅ Formulario obtenido:', {
      id: form.id,
      sections: sectionsWithQuestions.length,
      questions: questions?.length || 0
    })

    return NextResponse.json({
      ...form,
      sections: sectionsWithQuestions
    })

  } catch (err: unknown) {
    const error = err as Error
    console.error('❌ Error en GET /api/formularios/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

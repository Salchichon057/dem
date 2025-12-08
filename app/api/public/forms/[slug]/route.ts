import { NextResponse } from 'next/server'
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
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    console.log('🔍 [PUBLIC API] Obteniendo formulario por slug:', slug)

    // Obtener formulario con secciones y preguntas usando JOIN desde form_templates
    // NOTA: Las opciones de las preguntas están en el campo 'config' (JSONB), no en una tabla separada
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
      .eq('slug', slug)
      .eq('is_public', true)
      .eq('is_active', true)
      .single()

    console.log('📋 [PUBLIC API] Resultado:', { 
      found: !!formWithSections, 
      error: formError,
      formData: formWithSections ? { 
        id: formWithSections.id, 
        name: formWithSections.name,
        slug: formWithSections.slug,
        is_public: formWithSections.is_public,
        is_active: formWithSections.is_active,
        sectionsCount: formWithSections.form_sections?.length || 0
      } : null
    })

    if (formError || !formWithSections) {
      console.error('❌ [PUBLIC API] Error:', {
        error: formError,
        errorCode: formError?.code,
        errorMessage: formError?.message,
        slug: slug
      })
      return NextResponse.json(
        { error: 'Formulario no encontrado o no disponible públicamente' },
        { status: 404 }
      )
    }

    // Transformar al formato esperado (igual que en /api/formularios/[id])
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

    const response = {
      id: formWithSections.id,
      slug: formWithSections.slug,
      name: formWithSections.name,
      description: formWithSections.description,
      version: formWithSections.version,
      is_active: formWithSections.is_active,
      is_public: formWithSections.is_public,
      section_location: formWithSections.section_location,
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

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [PUBLIC API] Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error al cargar el formulario' },
      { status: 500 }
    )
  }
}

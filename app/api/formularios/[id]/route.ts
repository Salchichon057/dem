import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
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
    const { user, error: authError } = await withAuth()
    if (authError) return authError

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const { user, error: authError } = await withAuth()
    if (authError) return authError

    const { id } = await params
    const body = await req.json()

    // Verificar que el usuario sea el creador del formulario
    const { data: formCheck, error: checkError } = await supabase
      .from('form_templates')
      .select('created_by')
      .eq('id', id)
      .single()

    if (checkError || !formCheck) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 }
      )
    }

    // Solo el creador puede modificar el formulario
    if (formCheck.created_by !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este formulario' },
        { status: 403 }
      )
    }

    // Caso 1: Solo actualizar is_active (toggle activate/deactivate)
    if ('is_active' in body && !body.sections && !body.name) {      
      const { data, error } = await supabase
        .from('form_templates')
        .update({
          is_active: body.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Error al actualizar formulario', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    // Caso 2: Actualización completa del formulario (edit)    
    // Actualizar form_template
    const { data: updatedForm, error: updateError } = await supabase
      .from('form_templates')
      .update({
        name: body.name,
        description: body.description,
        slug: body.slug,
        is_public: body.is_public,
        section_location: body.section_location,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar formulario', details: updateError.message },
        { status: 500 }
      )
    }

    // Eliminar secciones y preguntas antiguas
    await supabase
      .from('questions')
      .delete()
      .eq('form_template_id', id)

    await supabase
      .from('form_sections')
      .delete()
      .eq('form_template_id', id)

    // Crear nuevas secciones y preguntas
    if (body.sections && body.sections.length > 0) {
      for (const section of body.sections) {
        const { data: newSection, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_template_id: id,
            title: section.title,
            description: section.description,
            order_index: section.order_index
          })
          .select()
          .single()

        if (sectionError || !newSection) {
          throw new Error(`Error al crear sección: ${sectionError?.message}`)
        }

        // Crear preguntas de esta sección
        if (section.questions && section.questions.length > 0) {
          const questionsToInsert = section.questions.map((q: { question_type_id: string; title: string; help_text?: string; is_required: boolean; order_index: number; config?: Record<string, unknown> }) => ({
            form_template_id: id,
            section_id: newSection.id,
            question_type_id: q.question_type_id,
            title: q.title,
            help_text: q.help_text,
            is_required: q.is_required,
            order_index: q.order_index,
            config: q.config || {}
          }))

          const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsToInsert)

          if (questionsError) {
            throw new Error(`Error al crear preguntas: ${questionsError.message}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedForm
    })

  } catch (err: unknown) {
    const error = err as Error
    console.error('❌ [API PUT] Error:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

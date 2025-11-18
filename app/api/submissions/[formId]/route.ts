import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'

// Mapeo de section_location a nombre de vista
const SECTION_TO_VIEW_MAP: Record<string, string> = {
  'organizaciones': 'organizations_submissions_view',
  'auditorias': 'audits_submissions_view',
  'comunidades': 'communities_submissions_view',
  'voluntariado': 'volunteer_submissions_view',
  'perfil-comunitario': 'community_profile_submissions_view',
  'abrazando-leyendas': 'embracing_legends_submissions_view'
}

/**
 * GET /api/submissions/[formId]
 * Obtiene todas las submissions de un formulario específico usando vistas SQL
 * Retorna datos en formato tabla con columnas dinámicas
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { formId } = await params

    // 1. Obtener el formulario y su section_location
    const { data: formTemplate, error: formError } = await supabase
      .from('form_templates')
      .select('id, name, section_location')
      .eq('id', formId)
      .single()

    if (formError || !formTemplate) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 }
      )
    }

    if (!formTemplate.section_location) {
      return NextResponse.json(
        { error: 'El formulario no tiene section_location definido' },
        { status: 400 }
      )
    }

    // 2. Obtener nombre de la vista según section_location
    const viewName = SECTION_TO_VIEW_MAP[formTemplate.section_location]
    if (!viewName) {
      return NextResponse.json(
        { error: `No existe vista para section_location: ${formTemplate.section_location}` },
        { status: 400 }
      )
    }

    // 3. Query directo a la vista
    const { data: viewData, error: viewError } = await supabase
      .from(viewName)
      .select('*')
      .eq('form_template_id', formId)
      .order('submitted_at', { ascending: false })
      .order('order_index', { ascending: true })

    if (viewError) {
      console.error('❌ Error al consultar vista:', viewError)
      return NextResponse.json(
        { error: 'Error al obtener submissions', details: viewError },
        { status: 500 }
      )
    }

    if (!viewData || viewData.length === 0) {
      // Obtener preguntas aunque no haya submissions
      const { data: questions } = await supabase
        .from('questions')
        .select('id, title, order_index, question_types(code)')
        .eq('form_template_id', formId)
        .order('order_index')

      return NextResponse.json({
        formName: formTemplate.name,
        columns: questions?.map(q => ({
          id: q.id,
          title: q.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: (q.question_types as any)?.code || 'TEXT'
        })) || [],
        data: []
      })
    }

    // 4. Transformar datos de la vista a formato tabla
    // Agrupar por submission_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submissionsMap = new Map<string, any>()
    const questionsSet = new Set<string>()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    viewData.forEach((row: any) => {
      if (!submissionsMap.has(row.submission_id)) {
        submissionsMap.set(row.submission_id, {
          submission_id: row.submission_id,
          submitted_at: row.submitted_at,
          user_name: row.user_name || row.user_email?.split('@')[0] || 'N/A',
          user_email: row.user_email || 'N/A'
        })
      }

      // Agregar respuesta si existe question_id
      if (row.question_id) {
        questionsSet.add(JSON.stringify({
          id: row.question_id,
          title: row.question_title,
          type: row.question_type || 'TEXT',
          order: row.order_index
        }))

        const submission = submissionsMap.get(row.submission_id)
        submission[row.question_id] = row.answer_value?.value || null
      }
    })

    // 5. Ordenar preguntas y crear columnas
    const questions = Array.from(questionsSet)
      .map(q => JSON.parse(q))
      .sort((a, b) => a.order - b.order)

    const columns = questions.map(q => ({
      id: q.id,
      title: q.title,
      type: q.type
    }))

    const data = Array.from(submissionsMap.values())

    return NextResponse.json({
      formName: formTemplate.name,
      columns,
      data
    })

  } catch (error) {
    console.error('❌ Error en GET /api/submissions/[formId]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

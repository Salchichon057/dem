import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import { FormSectionType, SUBMISSION_TABLES_MAP } from '@/lib/types'

/**
 * GET /api/submissions/[formId]
 * Obtiene todas las submissions de un formulario específico
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

    const sectionLocation = formTemplate.section_location as FormSectionType
    const tables = SUBMISSION_TABLES_MAP[sectionLocation]

    // 2. Obtener todas las preguntas del formulario ordenadas
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        title,
        order_index,
        question_types (
          code
        )
      `)
      .eq('form_template_id', formId)
      .order('order_index')

    if (questionsError) {
      return NextResponse.json(
        { error: 'Error al obtener preguntas', details: questionsError },
        { status: 500 }
      )
    }

    // 3. Obtener todas las submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from(tables.submissions)
      .select(`
        id,
        submitted_at,
        user_id,
        users (
          name,
          email
        )
      `)
      .eq('form_template_id', formId)
      .order('submitted_at', { ascending: false })

    if (submissionsError) {
      return NextResponse.json(
        { error: 'Error al obtener submissions', details: submissionsError },
        { status: 500 }
      )
    }

    // 4. Obtener todas las respuestas de esas submissions
    const submissionIds = submissions.map(s => s.id)
    
    if (submissionIds.length === 0) {
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

    const { data: answers, error: answersError } = await supabase
      .from(tables.answers)
      .select('submission_id, question_id, answer_value')
      .in('submission_id', submissionIds)

    if (answersError) {
      return NextResponse.json(
        { error: 'Error al obtener respuestas', details: answersError },
        { status: 500 }
      )
    }

    // 5. Transformar a formato tabla
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableData = submissions.map((submission: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submissionAnswers = answers?.filter((a: any) => a.submission_id === submission.id) || []
      
      const row: Record<string, unknown> = {
        submission_id: submission.id,
        submitted_at: submission.submitted_at,
        user_name: submission.users?.name || 'N/A',
        user_email: submission.users?.email || 'N/A'
      }

      // Agregar cada respuesta como columna
      questions?.forEach(question => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const answer = submissionAnswers.find((a: any) => a.question_id === question.id)
        row[question.id] = answer?.answer_value?.value || null
      })

      return row
    })

    return NextResponse.json({
      formName: formTemplate.name,
      columns: [
        { id: 'submission_id', title: 'ID', type: 'TEXT' },
        { id: 'submitted_at', title: 'Fecha', type: 'TEXT' },
        { id: 'user_name', title: 'Usuario', type: 'TEXT' },
        { id: 'user_email', title: 'Email', type: 'TEXT' },
        ...(questions?.map(q => ({
          id: q.id,
          title: q.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: (q.question_types as any)?.code || 'TEXT'
        })) || [])
      ],
      data: tableData
    })

  } catch (error) {
    console.error('❌ Error en GET /api/submissions/[formId]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

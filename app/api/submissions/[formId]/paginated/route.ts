/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'

const SECTION_TO_TABLES: Record<string, { submissions: string; answers: string }> = {
  'organizaciones': {
    submissions: 'organizations_submissions',
    answers: 'organizations_answers'
  },
  'auditorias': {
    submissions: 'audits_submissions',
    answers: 'audits_answers'
  },
  'comunidades': {
    submissions: 'communities_submissions',
    answers: 'communities_answers'
  },
  'voluntariado': {
    submissions: 'volunteer_submissions',
    answers: 'volunteer_answers'
  },
  'perfil-comunitario': {
    submissions: 'community_profile_submissions',
    answers: 'community_profile_answers'
  },
  'abrazando-leyendas': {
    submissions: 'embracing_legends_submissions',
    answers: 'embracing_legends_answers'
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { formId } = await params
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const { data: formTemplate, error: formError } = await supabase
      .from('form_templates')
      .select('id, name, section_location')
      .eq('id', formId)
      .single()

    if (formError || !formTemplate) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const tables = SECTION_TO_TABLES[formTemplate.section_location]
    if (!tables) {
      return NextResponse.json({ error: 'Tablas no encontradas' }, { status: 400 })
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from(tables.submissions)
      .select('id, submitted_at, user_id')
      .eq('form_template_id', formId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (submissionsError) {
      console.error('Error al obtener submissions:', submissionsError)
      return NextResponse.json({ error: 'Error al obtener submissions' }, { status: 500 })
    }

    if (!submissions || submissions.length === 0) {
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
          type: (q.question_types as any)?.code || 'TEXT'
        })) || [],
        data: []
      })
    }

    const userIds = [...new Set(submissions.map(s => s.user_id))].filter(id => id !== null)
    
    
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds)
        
    const usersMap = new Map(users?.map(u => [u.id, u]) || [])

    const { data: questions } = await supabase
      .from('questions')
      .select('id, title, order_index, question_types(code)')
      .eq('form_template_id', formId)
      .order('order_index')

    if (!questions) {
      return NextResponse.json({
        formName: formTemplate.name,
        columns: [],
        data: []
      })
    }

    const submissionIds = submissions.map(s => s.id)
    const { data: answers, error: answersError } = await supabase
      .from(tables.answers)
      .select('submission_id, question_id, answer_value')
      .in('submission_id', submissionIds)

    if (answersError) {
      console.error('Error al obtener answers:', answersError)
    }

    const answersBySubmission = new Map<string, Map<string, any>>()
    answers?.forEach(answer => {
      if (!answersBySubmission.has(answer.submission_id)) {
        answersBySubmission.set(answer.submission_id, new Map())
      }
      answersBySubmission.get(answer.submission_id)!.set(
        answer.question_id,
        answer.answer_value?.value || null
      )
    })

    const data = submissions.map((submission: any) => {
      const user = usersMap.get(submission.user_id)
      const submissionAnswers = answersBySubmission.get(submission.id) || new Map()

      // console.log(`📊 [PAGINATED] Procesando submission ${submission.id}:`, {
      //   user_id: submission.user_id,
      //   user_found: !!user,
      //   user_name: user?.name,
      //   user_email: user?.email
      // })

      const row: any = {
        submission_id: submission.id,
        submitted_at: submission.submitted_at,
        user_name: user?.name || user?.email?.split('@')[0] || 'N/A',
        user_email: user?.email || 'N/A'
      }

      questions.forEach(q => {
        row[q.id] = submissionAnswers.get(q.id) || null
      })

      return row
    })

    const columns = questions.map(q => ({
      id: q.id,
      title: q.title,
      type: (q.question_types as any)?.code || 'TEXT'
    }))

    return NextResponse.json({
      formName: formTemplate.name,
      columns,
      data
    })

  } catch (error) {
    console.error('Error en GET /api/submissions/[formId]/paginated:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

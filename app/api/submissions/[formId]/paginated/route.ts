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

    console.log('🔍 [PAGINATED] Form Template:', {
      formId,
      found: !!formTemplate,
      name: formTemplate?.name,
      section_location: formTemplate?.section_location,
      error: formError
    })

    if (formError || !formTemplate) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const tables = SECTION_TO_TABLES[formTemplate.section_location]
    if (!tables) {
      console.log('❌ [PAGINATED] No se encontraron tablas para section_location:', formTemplate.section_location)
      return NextResponse.json({ error: 'Tablas no encontradas' }, { status: 400 })
    }

    console.log('📋 [PAGINATED] Usando tablas:', tables)

    const { data: submissions, error: submissionsError } = await supabase
      .from(tables.submissions)
      .select('id, submitted_at, user_id')
      .eq('form_template_id', formId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('📊 [PAGINATED] Submissions encontradas:', submissions?.length || 0, 'de', tables.submissions)

    if (submissionsError) {
      console.error('❌ [PAGINATED] Error al obtener submissions:', submissionsError)
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

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        title,
        order_index,
        question_type_id,
        question_types!inner (
          id,
          code,
          name
        )
      `)
      .eq('form_template_id', formId)
      .order('order_index')

    if (questionsError) {
      console.error('❌ [PAGINATED] Error al obtener questions:', questionsError)
      return NextResponse.json({ 
        error: 'Error al obtener preguntas del formulario',
        details: questionsError.message 
      }, { status: 500 })
    if (!questions || questions.length === 0) {
      console.log('⚠️ [PAGINATED] No se encontraron preguntas para el formulario:', formId, 'section:', formTemplate.section_location)
      
      // CASO ESPECIAL: Voluntariado - las preguntas no están en la tabla questions
      // pero las respuestas SÍ están en volunteer_answers con question_ids hardcodeados
      if (formTemplate.section_location === 'voluntariado') {
        console.log('🔧 [PAGINATED] Detectado voluntariado, usando estructura híbrida')
        console.log('📋 [PAGINATED] Submissions a procesar:', submissions.length)
      if (formTemplate.section_location === 'voluntariado') {
        console.log('🔧 [PAGINATED] Usando estructura híbrida de voluntariado (answers + extras)')
        
        const submissionIds = submissions.map(s => s.id)
        
        // Obtener respuestas de volunteer_answers (aunque las questions no existan en la tabla)
        const { data: answers } = await supabase
          .from('volunteer_answers')
          .select('submission_id, question_id, answer_value')
          .in('submission_id', submissionIds)
        
        // Obtener extras de volunteer_extras
        const { data: extras } = await supabase
          .from('volunteer_extras')
          .select('*')
          .in('submission_id', submissionIds)
        
        const answersMap = new Map<string, Map<string, any>>()
        answers?.forEach(answer => {
          if (!answersMap.has(answer.submission_id)) {
            answersMap.set(answer.submission_id, new Map())
          }
          answersMap.get(answer.submission_id)!.set(
            answer.question_id,
            answer.answer_value?.value || null
          )
        })
        
        const extrasMap = new Map(extras?.map(e => [e.submission_id, e]) || [])
        
        // Question IDs hardcodeados del script import-volunteers.ts
        const QUESTION_IDS = {
          FECHA: '47c8d71a-9de8-44ef-bfcb-2914a37b2797',
          NOMBRE: '77cc0db8-a50a-412d-b3bc-0ff87ea58edd',
          ORGANIZACION: '3adff870-7197-4e33-be36-5f91778b6efd',
          TIPO_VOLUNTARIADO: '30b33c45-5c2f-4784-bf9c-a90cc7b734ef',
          HORA_INGRESO: '4e073bf3-ce31-4455-87eb-d9160c927479',
          HORA_SALIDA: 'd3150b11-4e55-4aa4-baea-134bfe2c64c8',
          TURNO: 'd8240c4e-a178-4708-aa73-f1a1deb91317'
        }
        
        const data = submissions.map((submission: any) => {
          const user = usersMap.get(submission.user_id)
          const submissionAnswers = answersMap.get(submission.id) || new Map()
          const extra = extrasMap.get(submission.id)
          
          return {
            submission_id: submission.id,
            submitted_at: submission.submitted_at,
            user_name: user?.name || user?.email?.split('@')[0] || 'N/A',
            user_email: user?.email || 'N/A',
            fecha: submissionAnswers.get(QUESTION_IDS.FECHA) || null,
            nombre: submissionAnswers.get(QUESTION_IDS.NOMBRE) || null,
            organizacion: submissionAnswers.get(QUESTION_IDS.ORGANIZACION) || null,
            tipo_voluntariado: submissionAnswers.get(QUESTION_IDS.TIPO_VOLUNTARIADO) || null,
            hora_ingreso: submissionAnswers.get(QUESTION_IDS.HORA_INGRESO) || null,
            hora_salida: submissionAnswers.get(QUESTION_IDS.HORA_SALIDA) || null,
            turno: submissionAnswers.get(QUESTION_IDS.TURNO) || null,
            total_hours: extra?.total_hours || null,
            receives_benefit: extra?.receives_benefit ? 'Sí' : 'No',
            benefit_number: extra?.benefit_number || null,
            agricultural_pounds: extra?.agricultural_pounds || null,
            group_number: extra?.group_number || null
          }
        })
        
        const columns = [
          { id: 'fecha', title: 'Fecha', type: 'DATE' },
          { id: 'nombre', title: 'Nombre', type: 'TEXT' },
          { id: 'organizacion', title: 'Organización', type: 'TEXT' },
          { id: 'tipo_voluntariado', title: 'Tipo', type: 'TEXT' },
          { id: 'hora_ingreso', title: 'Hora Ingreso', type: 'TIME' },
          { id: 'hora_salida', title: 'Hora Salida', type: 'TIME' },
          { id: 'turno', title: 'Turno', type: 'TEXT' },
          { id: 'total_hours', title: 'Horas Totales', type: 'NUMBER' },
          { id: 'receives_benefit', title: 'Recibe Beneficio', type: 'TEXT' },
          { id: 'benefit_number', title: 'No. Pedido', type: 'TEXT' },
          { id: 'agricultural_pounds', title: 'Libras Agrícolas', type: 'NUMBER' },
          { id: 'group_number', title: 'Grupo', type: 'NUMBER' }
        ]
        
        console.log(`✅ [PAGINATED] Voluntariado híbrido: ${columns.length} columns, ${data.length} rows`)
        
        return NextResponse.json({
          formName: formTemplate.name,
          columns,
          data
        })
      }
      
      return NextResponse.json({
        formName: formTemplate.name,
        columns: [],
        data: []
      })
    }

    console.log(`📋 [PAGINATED] Questions found: ${questions.length} para form ${formId}`)

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

    console.log(`✅ [PAGINATED] Formulario: ${formTemplate.name}, Columns: ${columns.length}, Data rows: ${data.length}`)

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

/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // 3. Determinar tablas según section_location
    const submissionsTable = formTemplate.section_location === 'organizaciones' ? 'organizations_submissions' :
                            formTemplate.section_location === 'auditorias' ? 'audits_submissions' :
                            formTemplate.section_location === 'comunidades' ? 'communities_submissions' :
                            formTemplate.section_location === 'voluntariado' ? 'volunteer_submissions' :
                            formTemplate.section_location === 'perfil-comunitario' ? 'community_profile_submissions' :
                            'embracing_legends_submissions'

    const answersTable = formTemplate.section_location === 'organizaciones' ? 'organizations_answers' :
                        formTemplate.section_location === 'auditorias' ? 'audits_answers' :
                        formTemplate.section_location === 'comunidades' ? 'communities_answers' :
                        formTemplate.section_location === 'voluntariado' ? 'volunteer_answers' :
                        formTemplate.section_location === 'perfil-comunitario' ? 'community_profile_answers' :
                        'embracing_legends_answers'

    // 4. Obtener TODAS las submissions del formulario
    const { data: submissions, error: submissionsError } = await supabase
      .from(submissionsTable)
      .select('id, submitted_at, user_id')
      .eq('form_template_id', formId)
      .order('submitted_at', { ascending: false })

    if (submissionsError) {
      console.error('❌ Error al obtener submissions:', submissionsError)
      return NextResponse.json(
        { error: 'Error al obtener submissions', details: submissionsError },
        { status: 500 }
      )
    }

    if (!submissions || submissions.length === 0) {
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
           
          type: (q.question_types as any)?.code || 'TEXT'
        })) || [],
        data: []
      })
    }

    // 5. Obtener usuarios
    const userIds = [...new Set(submissions.map(s => s.user_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds)
    
    const usersMap = new Map(users?.map(u => [u.id, u]) || [])

    // 6. Obtener preguntas del formulario
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

    // 7. Obtener TODAS las respuestas en lote (SIN LÍMITE)
    const submissionIds = submissions.map(s => s.id)
    // console.log(`📊 Buscando respuestas para ${submissionIds.length} submissions en tabla: ${answersTable}`)
    
    // CRÍTICO: Hacer múltiples queries si hay más de 1000 respuestas esperadas
    // Supabase tiene límite de 1000 por defecto
    const batchSize = 20 // Procesar 20 submissions a la vez para evitar límite
    let allAnswers: any[] = []
    
    for (let i = 0; i < submissionIds.length; i += batchSize) {
      const batch = submissionIds.slice(i, i + batchSize)
      const { data: batchAnswers, error: batchError } = await supabase
        .from(answersTable)
        .select('submission_id, question_id, answer_value')
        .in('submission_id', batch)
      
      if (batchError) {
        console.error(`❌ Error en batch ${i}-${i+batchSize}:`, batchError)
      } else {
        allAnswers = allAnswers.concat(batchAnswers || [])
      }
    }
    
    const answers = allAnswers
    // console.log(`✅ Respuestas obtenidas: ${answers.length} total (esperado: ~${submissionIds.length * 44})`)

    // 8. Organizar respuestas por submission
     
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

    // 9. Construir datos de la tabla
     
    const data = submissions.map((submission: any) => {
      const user = usersMap.get(submission.user_id)
      const submissionAnswers = answersBySubmission.get(submission.id) || new Map()

       
      const row: any = {
        submission_id: submission.id,
        submitted_at: submission.submitted_at,
        user_name: user?.name || user?.email?.split('@')[0] || 'N/A',
        user_email: user?.email || 'N/A'
      }

      // Agregar respuestas por question_id
      questions.forEach(q => {
        row[q.id] = submissionAnswers.get(q.id) || null
      })

      return row
    })

    // 10. Preparar columnas
    const columns = questions.map(q => ({
      id: q.id,
      title: q.title,
       
      type: (q.question_types as any)?.code || 'TEXT'
    }))

    // Log detallado para debugging
    // console.log(`\n${'='.repeat(80)}`)
    // console.log(`📋 RESUMEN FINAL - DATOS A ENVIAR`)
    // console.log(`${'='.repeat(80)}`)
    // console.log(`Total submissions construidas: ${data.length}`)
    // console.log(`Total columnas (preguntas): ${columns.length}`)
    // console.log(`Total respuestas obtenidas de BD: ${answers?.length || 0}`)
    // console.log(`Promedio respuestas/submission: ${answers?.length ? (answers.length / submissions.length).toFixed(1) : 0}`)
    
    // Verificar primeras 5 filas con detalle
    // console.log(`\n--- MUESTRA DE PRIMERAS 5 FILAS ---`)
    data.slice(0, 5).forEach((row, idx) => {
      const answeredCount = Object.keys(row).filter(k => 
        !['submission_id', 'submitted_at', 'user_name', 'user_email'].includes(k) && row[k] !== null
      ).length
      
      const firstQuestionAnswer = columns[0] ? row[columns[0].id] : 'N/A'
      
      // console.log(`\n[${idx + 1}] Submission: ${row.submission_id.substring(0, 8)}...`)
      // console.log(`    User: ${row.user_name}`)
      // console.log(`    Fecha: ${row.submitted_at}`)
      // console.log(`    Respuestas llenas: ${answeredCount}/${columns.length}`)
      // console.log(`    Primera pregunta ("${columns[0]?.title.substring(0, 50)}..."): ${firstQuestionAnswer || '(vacío)'}`)
    })
    
    // Verificar si hay filas completamente vacías
    const emptyRows = data.filter(row => {
      const answeredCount = Object.keys(row).filter(k => 
        !['submission_id', 'submitted_at', 'user_name', 'user_email'].includes(k) && row[k] !== null
      ).length
      return answeredCount === 0
    })
    
    // console.log(`\n⚠️  Filas SIN respuestas: ${emptyRows.length}/${data.length}`)
    if (emptyRows.length > 0) {
      // console.log(`IDs de submissions vacías:`, emptyRows.slice(0, 3).map(r => r.submission_id))
    }
    
    // Verificar estructura de answersBySubmission
    // console.log(`\n--- MAPA DE RESPUESTAS POR SUBMISSION ---`)
    // console.log(`Total submissions en mapa: ${answersBySubmission.size}`)
    const firstSubmissionId = submissions[0]?.id
    if (firstSubmissionId && answersBySubmission.has(firstSubmissionId)) {
      const firstSubmAnswers = answersBySubmission.get(firstSubmissionId)!
      // console.log(`Ejemplo - Primera submission (${firstSubmissionId.substring(0, 8)}...) tiene ${firstSubmAnswers.size} respuestas en mapa`)
    }
    
    // console.log(`${'='.repeat(80)}\n`)

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

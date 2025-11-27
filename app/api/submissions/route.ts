/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import { createSubmission, createAnswers } from '@/lib/supabase/submissions'
import { FormSectionType } from '@/lib/types'

/**
 * POST /api/submissions
 * Crea una nueva submission con sus respuestas
 * El section_location del formulario determina en qué tabla se guarda
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await withAuth()
    if (authError) return authError

    const body = await request.json()
    const { form_template_id, answers } = body

    // Debug: Ver qué llega al servidor
)
    if (!form_template_id || !answers) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: form_template_id, answers' },
        { status: 400 }
      )
    }

    // Obtener el section_location del formulario
    const { data: formTemplate, error: formError } = await supabase
      .from('form_templates')
      .select('section_location')
      .eq('id', form_template_id)
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

    // Crear la submission en la tabla correspondiente
    const submission = await createSubmission(sectionLocation, {
      form_template_id,
      user_id: user.id,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // Preparar las respuestas
    const answersData = answers.map((answer: any) => ({
      submission_id: submission.id,
      question_id: answer.question_id,
      answer_value: answer.answer_value,
      created_at: new Date().toISOString()
    }))
)

    // Crear las respuestas en la tabla correspondiente
    const createdAnswers = await createAnswers(sectionLocation, answersData)
    return NextResponse.json({
      success: true,
      submission,
      answers: createdAnswers
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear submission' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/submissions?form_template_id=xxx
 * Obtiene todas las submissions de un formulario
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const formTemplateId = searchParams.get('form_template_id')

    if (!formTemplateId) {
      return NextResponse.json(
        { error: 'Falta el parámetro form_template_id' },
        { status: 400 }
      )
    }

    // Obtener el section_location del formulario
    const { data: formTemplate, error: formError } = await supabase
      .from('form_templates')
      .select('section_location')
      .eq('id', formTemplateId)
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

    // Obtener submissions de la tabla correspondiente
    const { getSubmissionsByFormId } = await import('@/lib/supabase/submissions')
    const submissions = await getSubmissionsByFormId(sectionLocation, formTemplateId)

    return NextResponse.json({
      submissions,
      total: submissions.length
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener submissions' },
      { status: 500 }
    )
  }
}


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
    // Intentar autenticar, pero no fallar si no hay usuario (para formularios públicos)
    const authResult = await withAuth()
    const authenticatedSupabase = authResult.error ? null : authResult.supabase
    const authenticatedUser = authResult.error ? null : authResult.user

    // console.log('🔍 [SUBMISSIONS] Auth Result:', {
    //   hasError: !!authResult.error,
    //   errorMessage: authResult.error,
    //   userId: authenticatedUser?.id,
    //   userEmail: authenticatedUser?.email
    // })

    const body = await request.json()
    const { form_template_id, answers, isPublic } = body

    // console.log('📋 [SUBMISSIONS] Request Data:', {
    //   form_template_id,
    //   isPublic,
    //   answersCount: answers?.length
    // })

    if (!form_template_id || !answers) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: form_template_id, answers' },
        { status: 400 }
      )
    }

    // Para formularios públicos, usar cliente sin auth
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = isPublic 
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : authenticatedSupabase

    if (!supabase) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el section_location y validar si es público
    const { data: formTemplate, error: formError } = await supabase
      .from('form_templates')
      .select('section_location, is_public, is_active')
      .eq('id', form_template_id)
      .single()

    if (formError || !formTemplate) {
      return NextResponse.json(
        { error: 'Formulario no encontrado' },
        { status: 404 }
      )
    }

    // Si se intenta enviar como público, validar que realmente sea público y activo
    if (isPublic && (!formTemplate.is_public || !formTemplate.is_active)) {
      return NextResponse.json(
        { error: 'Este formulario no acepta envíos públicos' },
        { status: 403 }
      )
    }

    if (!formTemplate.section_location) {
      return NextResponse.json(
        { error: 'El formulario no tiene section_location definido' },
        { status: 400 }
      )
    }

    const sectionLocation = formTemplate.section_location as FormSectionType

    // Si no es público, validar que haya usuario autenticado
    if (!isPublic && !authenticatedUser?.id) {
      // console.log('❌ [SUBMISSIONS] No hay usuario autenticado para formulario privado')
      return NextResponse.json(
        { error: 'Debe iniciar sesión para enviar este formulario' },
        { status: 401 }
      )
    }

    const finalUserId = isPublic ? null : authenticatedUser!.id
    // console.log('✅ [SUBMISSIONS] Creando submission con:', {
    //   sectionLocation,
    //   form_template_id,
    //   user_id: finalUserId,
    //   isPublic
    // })

    // Crear la submission en la tabla correspondiente
    // user_id será null solo para formularios públicos
    const submission = await createSubmission(sectionLocation, {
      form_template_id,
      user_id: finalUserId,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // console.log('💾 [SUBMISSIONS] Submission creada:', {
    //   submission_id: submission.id,
    //   user_id: submission.user_id
    // })

    // Preparar las respuestas
    const answersData = answers.map((answer: any) => ({
      submission_id: submission.id,
      question_id: answer.question_id,
      answer_value: answer.answer_value,
      created_at: new Date().toISOString()
    }))

    // Crear las respuestas en la tabla correspondiente
    const createdAnswers = await createAnswers(sectionLocation, answersData)
    return NextResponse.json({
      success: true,
      submission,
      answers: createdAnswers
    })

  } catch {
    return NextResponse.json(
      { error: 'Error al crear submission' },
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

  } catch {
    return NextResponse.json(
      { error: 'Error al obtener submissions' },
      { status: 500 }
    )
  }
}




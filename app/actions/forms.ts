'use server'

import { createClient } from '@/lib/supabase/server'

export async function getFormBySlug(slug: string) {
  const supabase = await createClient()
  try {
    console.log('🔍 Buscando formulario por slug:', slug)

    // Obtener formulario
    const { data: form, error: formError } = await supabase
      .from('form_templates')
      .select(`
        id,
        slug,
        name,
        description,
        version,
        is_active,
        is_public,
        created_by,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .eq('is_public', true)
      .eq('is_active', true)
      .single()

    if (formError || !form) {
      console.error('❌ Error al obtener formulario:', formError)
      return { success: false, data: null, error: formError?.message || 'Formulario no encontrado' }
    }

    console.log('✅ Formulario encontrado:', form.id)

    // Obtener preguntas con sus tipos Y secciones (JOIN en una sola query)
    // Esto evita problemas de RLS haciendo solo 1 query en lugar de 2
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
          description,
          validation_schema,
          created_at
        ),
        form_sections (
          id,
          form_template_id,
          title,
          description,
          order_index,
          created_at
        )
      `)
      .eq('form_template_id', form.id)
      .order('order_index', { ascending: true })

    if (questionsError) {
      console.error('❌ Error al obtener preguntas:', {
        message: questionsError.message,
        details: questionsError.details,
        hint: questionsError.hint,
        code: questionsError.code
      })
      return { success: false, data: null, error: questionsError.message }
    }

    console.log('✅ Preguntas encontradas:', questions?.length || 0)

    // Transformar questions: convertir relaciones de array a objeto
    const transformedQuestions = questions?.map(q => ({
      ...q,
      question_types: Array.isArray(q.question_types) 
        ? q.question_types[0] 
        : q.question_types,
      form_sections: Array.isArray(q.form_sections)
        ? q.form_sections[0]
        : q.form_sections
    })) || []

    // Extraer secciones únicas de las preguntas
    const sectionsMap = new Map()
    transformedQuestions.forEach(q => {
      if (q.form_sections && !sectionsMap.has(q.form_sections.id)) {
        sectionsMap.set(q.form_sections.id, q.form_sections)
      }
    })
    const sections = Array.from(sectionsMap.values()).sort((a, b) => a.order_index - b.order_index)

    // Organizar preguntas por sección
    const sectionsWithQuestions = sections.map(section => ({
      ...section,
      questions: transformedQuestions.filter(q => q.section_id === section.id)
    }))

    const formWithQuestions = {
      ...form,
      sections: sectionsWithQuestions,
      questions: transformedQuestions
    }

    return { success: true, data: formWithQuestions, error: null }
  } catch (error) {
    console.error('❌ Error general en getFormBySlug:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

interface SubmitFormInput {
  formId: string
  answers: Array<{
    questionId: string
    answerValue: string | number | boolean | string[] | Record<string, string> | null
  }>
  timeSpentSeconds?: number
}

export async function submitFormResponse(data: SubmitFormInput) {
  const supabase = await createClient()
  try {
    console.log('📝 Guardando respuesta del formulario:', data.formId)

    // Crear submission (sin user_id por ahora - formularios anónimos)
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_template_id: data.formId,
        user_id: null, // Formularios anónimos por ahora
        status: 'completed',
        time_spent_seconds: data.timeSpentSeconds || null,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (submissionError || !submission) {
      console.error('❌ Error al crear submission:', submissionError)
      return { 
        success: false, 
        submissionId: null, 
        error: submissionError?.message || 'Error al guardar el formulario' 
      }
    }

    console.log('✅ Submission creada:', submission.id)

    // Guardar respuestas individuales
    const answersToInsert = data.answers.map(answer => ({
      submission_id: submission.id,
      question_id: answer.questionId,
      answer_value: { value: answer.answerValue },
      created_at: new Date().toISOString()
    }))

    const { error: answersError } = await supabase
      .from('submission_answers')
      .insert(answersToInsert)

    if (answersError) {
      console.error('❌ Error al guardar respuestas:', answersError)
      
      // Intentar eliminar submission si falla
      await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submission.id)
      
      return { 
        success: false, 
        submissionId: null, 
        error: answersError.message 
      }
    }

    console.log('✅ Respuestas guardadas:', answersToInsert.length)

    return { 
      success: true, 
      submissionId: submission.id, 
      error: null 
    }
  } catch (error) {
    console.error('❌ Error general en submitFormResponse:', error)
    return { 
      success: false, 
      submissionId: null, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

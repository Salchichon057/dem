/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
// import { FormSectionType } from '@/lib/types' // Temporalmente deshabilitado
import { getSubmissionTables } from '@/lib/supabase/submissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; submissionId: string }> }
) {
  try {
    const { supabase, error } = await withAuth()
    if (error) return error

    const { formId, submissionId } = await params

    const { data: form, error: formError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      console.error('Form not found:', formError)
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    if (!form.section_location) {
      console.error('Form has no section_location:', form)
      return NextResponse.json({ error: 'Formulario sin section_location' }, { status: 400 })
    }

    const sectionLocation = form.section_location as string
    const { submissions: submissionsTable, answers: answersTable } = getSubmissionTables(sectionLocation)

    const { data: submission, error: submissionError } = await supabase
      .from(submissionsTable)
      .select('*')
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      console.error('Submission not found:', submissionError)
      return NextResponse.json({ error: 'Submission no encontrado' }, { status: 404 })
    }

    const { data: answers, error: answersError } = await supabase
      .from(answersTable)
      .select(`
        id,
        question_id,
        answer_value,
        questions (
          id,
          title,
          question_type_id,
          is_required,
          config,
          order_index,
          help_text,
          question_types (code, name)
        )
      `)
      .eq('submission_id', submissionId)
      .order('questions(order_index)', { ascending: true })

    if (answersError) {
      console.error('Answers error:', answersError)
      return NextResponse.json({ error: answersError.message }, { status: 500 })
    }

    return NextResponse.json({
      form,
      submission,
      answers
    })
  } catch (error: any) {
    console.error('Error fetching submission:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; submissionId: string }> }
) {
  try {
    const { supabase, error } = await withAuth()
    if (error) return error

    const { formId, submissionId } = await params
    const body = await request.json()
    const { answers } = body

    console.log('PUT submission:', { formId, submissionId, answersCount: answers?.length })

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers es requerido' }, { status: 400 })
    }

    const { data: form, error: formError } = await supabase
      .from('form_templates')
      .select('section_location')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      console.error('Form not found in PUT:', formError)
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    if (!form.section_location) {
      console.error('Form has no section_location in PUT:', form)
      return NextResponse.json({ error: 'Formulario sin section_location' }, { status: 400 })
    }

    const sectionLocation = form.section_location as string
    const { submissions: submissionsTable, answers: answersTable } = getSubmissionTables(sectionLocation)

    // Actualizar el timestamp del submission
    const { error: submissionUpdateError } = await supabase
      .from(submissionsTable)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', submissionId)

    if (submissionUpdateError) {
      console.error('Error updating submission timestamp:', submissionUpdateError)
    }

    // Actualizar cada respuesta usando question_id
    for (const answer of answers) {
      const { question_id, answer_value } = answer

      console.log('Updating answer:', { question_id, answer_value })

      const { error: updateError } = await supabase
        .from(answersTable)
        .update({ 
          answer_value,
          created_at: new Date().toISOString() // Actualizar timestamp
        })
        .eq('question_id', question_id)
        .eq('submission_id', submissionId)

      if (updateError) {
        console.error('Error updating answer:', { question_id, error: updateError })
        return NextResponse.json({ 
          error: `Error actualizando respuesta: ${updateError.message}` 
        }, { status: 500 })
      }
    }

    console.log('All answers updated successfully')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating submission:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

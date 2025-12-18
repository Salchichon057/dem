/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import { FormSectionType } from '@/lib/types'
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
      .select('section_location')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const sectionLocation = form.section_location as FormSectionType
    const { submissions: submissionsTable, answers: answersTable } = getSubmissionTables(sectionLocation)

    const { data: submission, error: submissionError } = await supabase
      .from(submissionsTable)
      .select('*')
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
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
          question_types (code, name)
        )
      `)
      .eq('submission_id', submissionId)

    if (answersError) {
      return NextResponse.json({ error: answersError.message }, { status: 500 })
    }

    return NextResponse.json({
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

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers es requerido' }, { status: 400 })
    }

    const { data: form, error: formError } = await supabase
      .from('form_templates')
      .select('section_location')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const sectionLocation = form.section_location as FormSectionType
    const { answers: answersTable } = getSubmissionTables(sectionLocation)

    for (const answer of answers) {
      const { id, answer_value } = answer

      await supabase
        .from(answersTable)
        .update({ answer_value })
        .eq('id', id)
        .eq('submission_id', submissionId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating submission:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

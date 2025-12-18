import { useState, useEffect } from 'react'
import type { FormTemplateWithQuestions } from '@/lib/types'

interface SubmissionEditState {
  formId: string | null
  submissionId: string | null
  form: FormTemplateWithQuestions | null
  initialAnswers: Record<string, unknown>
  loading: boolean
}

export function useFormSubmissionEdit() {
  const [editState, setEditState] = useState<SubmissionEditState>({
    formId: null,
    submissionId: null,
    form: null,
    initialAnswers: {},
    loading: false
  })

  useEffect(() => {
    const loadSubmissionData = async () => {
      if (!editState.formId || !editState.submissionId) return

      setEditState(prev => ({ ...prev, loading: true }))

      try {
        const response = await fetch(`/api/submissions/${editState.formId}/${editState.submissionId}`)
        const data = await response.json()

        if (response.ok && data.submission) {
          const form: FormTemplateWithQuestions = {
            ...data.submission.form_templates,
            questions: data.answers.map((ans: { questions: unknown }) => ans.questions)
          }

          const initialAnswers: Record<string, unknown> = {}
          data.answers.forEach((answer: { question_id: string; answer_value: { value: unknown } }) => {
            initialAnswers[answer.question_id] = answer.answer_value?.value
          })

          setEditState(prev => ({
            ...prev,
            form,
            initialAnswers,
            loading: false
          }))
        }
      } catch (error) {
        console.error('Error loading submission:', error)
        setEditState(prev => ({ ...prev, loading: false }))
      }
    }

    if (editState.formId && editState.submissionId) {
      loadSubmissionData()
    }
  }, [editState.formId, editState.submissionId])

  const startEdit = (formId: string, submissionId: string) => {
    setEditState({
      formId,
      submissionId,
      form: null,
      initialAnswers: {},
      loading: true
    })
  }

  const cancelEdit = () => {
    setEditState({
      formId: null,
      submissionId: null,
      form: null,
      initialAnswers: {},
      loading: false
    })
  }

  return {
    editState,
    startEdit,
    cancelEdit,
    isEditing: editState.formId !== null && editState.submissionId !== null
  }
}

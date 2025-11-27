"use client"

import { useState, useCallback } from 'react'
import { FormTemplateWithQuestions } from '@/lib/types'

export interface SubmissionData {
  answers: Record<string, unknown>
  formId: string
  sectionIndex: number
}

export function useFormSubmission(form: FormTemplateWithQuestions) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [missingFields, setMissingFields] = useState<string[]>([])

  const updateAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Limpiar error si existe
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }, [errors])

  const validateSection = useCallback((sectionIndex: number) => {
    const section = form.sections[sectionIndex]
    const newErrors: Record<string, string> = {}
    const missing: string[] = []

    section.questions.forEach(question => {
      if (question.is_required && !answers[question.id]) {
        newErrors[question.id] = 'Este campo es obligatorio'
        missing.push(question.title)
      }
    })

    setErrors(newErrors)
    setMissingFields(missing)

    return Object.keys(newErrors).length === 0
  }, [form.sections, answers])

  const nextSection = useCallback(() => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, form.sections.length - 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setShowValidationModal(true)
    }
  }, [currentSection, form.sections.length, validateSection])

  const previousSection = useCallback(() => {
    setCurrentSection(prev => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const submitForm = useCallback(async () => {
    // Validar última sección
    if (!validateSection(currentSection)) {
      setShowValidationModal(true)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form_id: form.id,
          answers
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar el formulario')
      }

      setShowSuccessModal(true)
      
      // Limpiar formulario después de enviar
      setAnswers({})
      setCurrentSection(0)
      setErrors({})
      
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido')
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentSection, validateSection, form.id, answers])

  const resetForm = useCallback(() => {
    setAnswers({})
    setCurrentSection(0)
    setErrors({})
    setMissingFields([])
    setShowSuccessModal(false)
    setShowErrorModal(false)
    setShowValidationModal(false)
    setErrorMessage('')
  }, [])

  const getProgress = useCallback(() => {
    return ((currentSection + 1) / form.sections.length) * 100
  }, [currentSection, form.sections.length])

  return {
    answers,
    currentSection,
    errors,
    isSubmitting,
    showSuccessModal,
    showErrorModal,
    showValidationModal,
    errorMessage,
    missingFields,
    updateAnswer,
    nextSection,
    previousSection,
    submitForm,
    resetForm,
    getProgress,
    setShowSuccessModal,
    setShowErrorModal,
    setShowValidationModal
  }
}


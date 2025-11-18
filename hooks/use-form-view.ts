"use client"

import { useState, useCallback } from 'react'
import { FormTemplateWithQuestions } from '@/lib/types'

export type ViewMode = 'list' | 'view' | 'create' | 'edit'

export function useFormView(initialView: ViewMode = 'list') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)
  const [viewingForm, setViewingForm] = useState<FormTemplateWithQuestions | null>(null)
  const [editingFormId, setEditingFormId] = useState<string | null>(null)

  const handleViewForm = useCallback((form: FormTemplateWithQuestions) => {
    setViewingForm(form)
    setViewMode('view')
  }, [])

  const handleCreateForm = useCallback(() => {
    setViewMode('create')
    setEditingFormId(null)
    setViewingForm(null)
  }, [])

  const handleEditForm = useCallback((formId: string) => {
    setEditingFormId(formId)
    setViewMode('edit')
    setViewingForm(null)
  }, [])

  const handleBackToList = useCallback(() => {
    setViewMode('list')
    setViewingForm(null)
    setEditingFormId(null)
  }, [])

  const resetView = useCallback(() => {
    setViewMode('list')
    setViewingForm(null)
    setEditingFormId(null)
  }, [])

  return {
    viewMode,
    viewingForm,
    editingFormId,
    setViewMode,
    handleViewForm,
    handleCreateForm,
    handleEditForm,
    handleBackToList,
    resetView
  }
}

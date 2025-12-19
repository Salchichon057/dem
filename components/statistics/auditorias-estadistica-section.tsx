"use client"

import { useState } from "react"
import DynamicFormSubmissionsTable from "@/components/forms/dynamic-form-submissions-table"
import FormRenderer from "@/components/form/FormRenderer"
import { useFormSubmissionEdit } from "@/hooks/use-form-submission-edit"
import { useUserPermissions } from '@/hooks/use-user-permissions'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type ViewMode = 'list' | 'edit-submission'

export function AuditoriasEstadisticaSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { editState, startEdit, cancelEdit, isEditing } = useFormSubmissionEdit()
  const { canEdit } = useUserPermissions()

  const handleEditSubmission = (formId: string, submissionId: string) => {
    if (!canEdit) return
    console.log('Edit submission clicked:', { formId, submissionId })
    startEdit(formId, submissionId)
    setViewMode('edit-submission')
  }

  const handleBackToList = () => {
    cancelEdit()
    setViewMode('list')
  }

  if (viewMode === 'edit-submission' && isEditing && editState.form) {
    return (
      <div className="space-y-6">
        <Button 
          onClick={handleBackToList} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Estadística
        </Button>
        
        {editState.loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <FormRenderer
            form={editState.form}
            isPublic={false}
            initialAnswers={editState.initialAnswers}
            submissionId={editState.submissionId!}
            isEditMode={true}
            onSuccess={handleBackToList}
          />
        )}
      </div>
    )
  }

  return (
    <DynamicFormSubmissionsTable
      sectionLocation="auditorias"
      sectionTitle="Auditorías"
      onEditSubmission={handleEditSubmission}
    />
  )
}

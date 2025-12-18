'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, BarChart3, ArrowLeft } from 'lucide-react'
import DynamicFormSubmissionsTable from '@/components/forms/dynamic-form-submissions-table'
import OrganizationsCharts from '@/components/statistics/organizations-charts'
import FormRenderer from "@/components/form/FormRenderer"
import { useFormSubmissionEdit } from "@/hooks/use-form-submission-edit"

type ViewMode = 'table' | 'charts' | 'edit-submission'

export default function OrganizationsSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const { editState, startEdit, isEditing } = useFormSubmissionEdit()

  const handleEditSubmission = (formId: string, submissionId: string) => {
    console.log('Edit submission clicked:', { formId, submissionId })
    startEdit(formId, submissionId)
    setViewMode('edit-submission')
  }

  const handleBackToTable = () => {
    setViewMode('table')
  }

  if (viewMode === 'edit-submission' && isEditing && editState.form) {
    return (
      <div className="space-y-6">
        <Button 
          onClick={handleBackToTable} 
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
            onSuccess={handleBackToTable}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedFormId && selectedFormId !== 'none' && (
        <div className="flex gap-2 border-b">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            onClick={() => setViewMode('table')}
            className="gap-2 text-sm"
          >
            <Table className="w-4 h-4" />
            Datos
          </Button>
          <Button
            variant={viewMode === 'charts' ? 'default' : 'ghost'}
            onClick={() => setViewMode('charts')}
            className="gap-2 text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </Button>
        </div>
      )}

      {viewMode === 'table' ? (
        <DynamicFormSubmissionsTable
          sectionLocation="organizaciones"
          sectionTitle="Organizaciones"
          onFormSelect={setSelectedFormId}
          onEditSubmission={handleEditSubmission}
        />
      ) : viewMode === 'charts' && selectedFormId && selectedFormId !== 'none' ? (
        <OrganizationsCharts formId={selectedFormId} />
      ) : (
        <div className="flex items-center justify-center min-h-[400px] text-gray-500">
          Selecciona un formulario para ver las estadísticas
        </div>
      )}
    </div>
  )
}

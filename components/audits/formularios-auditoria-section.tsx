"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { FormsList, FormRenderer, FormBuilder } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"
import { useFormSubmissionEdit } from "@/hooks/use-form-submission-edit"
import DynamicFormSubmissionsTable from "@/components/forms/dynamic-form-submissions-table"

type ViewMode = 'list' | 'view' | 'create' | 'edit' | 'submissions' | 'edit-submission';

export function FormulariosAuditoriaSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [viewingForm, setViewingForm] = useState<FormTemplateWithQuestions | null>(null);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const { editState, startEdit, cancelEdit, isEditing } = useFormSubmissionEdit();

  const handleViewForm = (form: FormTemplateWithQuestions) => {
    setViewingForm(form);
    setViewMode('view');
  };

  const handleCreateForm = () => setViewMode('create');
  const handleEditForm = (formId: string) => {
    setEditingFormId(formId);
    setViewMode('edit');
  };
  
  const handleEditSubmission = (formId: string, submissionId: string) => {
    console.log('handleEditSubmission called:', { formId, submissionId })
    startEdit(formId, submissionId);
    setViewMode('edit-submission');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setViewingForm(null);
    setEditingFormId(null);
    cancelEdit();
  };

  const handleBackToSubmissions = () => {
    setViewMode('submissions');
    cancelEdit();
  };

  if (viewMode === 'view' && viewingForm) {
    return (
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la lista
          </button>
        </div>
        <FormRenderer form={viewingForm} onSuccess={handleBackToList} />
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-6">
          <button onClick={handleBackToList} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>
        <FormBuilder mode="create" sectionLocation={FormSectionType.AUDITORIAS} onSuccess={handleBackToList} onCancel={handleBackToList} />
      </div>
    );
  }

  if (viewMode === 'submissions') {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-6">
          <button onClick={handleBackToList} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
        </div>
        <DynamicFormSubmissionsTable
          sectionLocation={FormSectionType.AUDITORIAS}
          sectionTitle="Auditorías"
          onEditSubmission={handleEditSubmission}
        />
      </div>
    );
  }

  if (viewMode === 'edit-submission' && isEditing && editState.form) {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-6">
          <button onClick={handleBackToSubmissions} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a formularios enviados
          </button>
        </div>
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
            onSuccess={handleBackToSubmissions}
          />
        )}
      </div>
    );
  }

  if (viewMode === 'edit' && editingFormId) {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-6">
          <button onClick={handleBackToList} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>
        <FormBuilder mode="edit" formId={editingFormId} sectionLocation={FormSectionType.AUDITORIAS} onSuccess={handleBackToList} onCancel={handleBackToList} />
      </div>
    );
  }

  return (
    <FormsList 
      sectionLocation={FormSectionType.AUDITORIAS} 
      locationName="Auditorías"
      onViewForm={handleViewForm}
      onCreateForm={handleCreateForm}
      onEditForm={handleEditForm}
    />
  )
}

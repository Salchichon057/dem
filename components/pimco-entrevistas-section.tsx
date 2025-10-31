"use client"

import { useState } from "react"
import { FormsList, FormRenderer, FormBuilder } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"

type ViewMode = 'list' | 'view' | 'create' | 'edit';

export function PIMCOEntrevistasSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [viewingForm, setViewingForm] = useState<FormTemplateWithQuestions | null>(null);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  const handleViewForm = (form: FormTemplateWithQuestions) => {
    setViewingForm(form);
    setViewMode('view');
  };

  const handleCreateForm = () => setViewMode('create');
  const handleEditForm = (formId: string) => {
    setEditingFormId(formId);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setViewingForm(null);
    setEditingFormId(null);
  };

  if (viewMode === 'view' && viewingForm) {
    return (
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Volver a la lista
          </button>
        </div>
        <FormRenderer form={viewingForm} />
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-6">
          <button onClick={handleBackToList} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium">
            <i className="fas fa-arrow-left mr-2"></i>
            Cancelar
          </button>
        </div>
        <FormBuilder mode="create" sectionLocation={FormSectionType.PERFIL_COMUNITARIO} onSuccess={handleBackToList} onCancel={handleBackToList} />
      </div>
    );
  }

  if (viewMode === 'edit' && editingFormId) {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-6">
          <button onClick={handleBackToList} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium">
            <i className="fas fa-arrow-left mr-2"></i>
            Cancelar
          </button>
        </div>
        <FormBuilder mode="edit" formId={editingFormId} sectionLocation={FormSectionType.PERFIL_COMUNITARIO} onSuccess={handleBackToList} onCancel={handleBackToList} />
      </div>
    );
  }

  return (
    <FormsList 
      sectionLocation={FormSectionType.PERFIL_COMUNITARIO} 
      locationName="Entrevistas PIMCO"
      onViewForm={handleViewForm}
      onCreateForm={handleCreateForm}
      onEditForm={handleEditForm}
    />
  )
}

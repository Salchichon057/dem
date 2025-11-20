"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { FormsList, FormRenderer, FormBuilder } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"

type ViewMode = 'list' | 'view' | 'create' | 'edit';

export function FormularioVoluntariadoSection() {
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
        <FormBuilder mode="create" sectionLocation={FormSectionType.VOLUNTARIADO} onSuccess={handleBackToList} onCancel={handleBackToList} />
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
        <FormBuilder mode="edit" formId={editingFormId} sectionLocation={FormSectionType.VOLUNTARIADO} onSuccess={handleBackToList} onCancel={handleBackToList} />
      </div>
    );
  }

  return (
    <FormsList 
      sectionLocation={FormSectionType.VOLUNTARIADO}
      locationName="Voluntariado"
      onViewForm={handleViewForm}
      onCreateForm={handleCreateForm}
      onEditForm={handleEditForm}
    />
  )
}

"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { FormsList, FormRenderer, FormBuilder } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"

type ViewMode = 'list' | 'view' | 'create' | 'edit';

export function FormulariosSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [viewingForm, setViewingForm] = useState<FormTemplateWithQuestions | null>(null);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // Manejar visualización de formulario
  const handleViewForm = (form: FormTemplateWithQuestions) => {
    setViewingForm(form);
    setViewMode('view');
  };

  // Manejar creación de formulario
  const handleCreateForm = () => {
    setViewMode('create');
  };

  // Manejar edición de formulario
  const handleEditForm = (formId: string) => {
    setEditingFormId(formId);
    setViewMode('edit');
  };

  // Volver a la lista
  const handleBackToList = () => {
    setViewMode('list');
    setViewingForm(null);
    setEditingFormId(null);
  };

  // Vista de formulario (para responderlo)
  if (viewMode === 'view' && viewingForm) {
    return (
      <div className="space-y-6">
        {/* Botón de regresar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la lista
          </button>
        </div>

        <FormRenderer form={viewingForm} />
      </div>
    );
  }

  // Vista de crear formulario
  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        {/* Botón de regresar */}
        <div className="px-4 sm:px-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>

        <FormBuilder
          mode="create"
          sectionLocation={FormSectionType.ORGANIZACIONES}
          onSuccess={handleBackToList}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // Vista de editar formulario
  if (viewMode === 'edit' && editingFormId) {
    return (
      <div className="space-y-6">
        {/* Botón de regresar */}
        <div className="px-4 sm:px-6">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancelar
          </button>
        </div>

        <FormBuilder
          mode="edit"
          formId={editingFormId}
          sectionLocation={FormSectionType.ORGANIZACIONES}
          onSuccess={handleBackToList}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // Vista de lista
  return (
    <FormsList
      sectionLocation={FormSectionType.ORGANIZACIONES}
      locationName="Organizaciones"
      onViewForm={handleViewForm}
      onCreateForm={handleCreateForm}
      onEditForm={handleEditForm}
    />
  );
}

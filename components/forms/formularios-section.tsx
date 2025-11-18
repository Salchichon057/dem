"use client"

import { ArrowLeft } from "lucide-react"
import { FormsList, FormRenderer, FormBuilder } from "@/components/form"
import { FormSectionType } from "@/lib/types"
import { useFormView } from "@/hooks/use-form-view"

export function FormulariosSection() {
  const {
    viewMode,
    viewingForm,
    editingFormId,
    handleViewForm,
    handleCreateForm,
    handleEditForm,
    handleBackToList
  } = useFormView('list')

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

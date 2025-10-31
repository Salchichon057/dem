"use client"

import { useState } from "react"
import { FormsList, FormRenderer } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"

export function PIMCOEntrevistasSection() {
  const [viewingForm, setViewingForm] = useState<FormTemplateWithQuestions | null>(null)

  if (viewingForm) {
    return (
      <div className="space-y-6">
        {/* Botón de regresar - Estilo mejorado */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setViewingForm(null)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-[#e6235a] hover:text-[#e6235a] transition-all shadow-sm font-medium"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Volver a la lista
          </button>
        </div>

        {/* Header del formulario - Estilo dem-forms */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm border-t-4 border-[#e6235a] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">{viewingForm.name}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <i className="far fa-question-circle text-[#e6235a]"></i>
                  <span>{viewingForm.questions?.length || 0} preguntas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="far fa-clock text-[#e6235a]"></i>
                  <span>Versión {viewingForm.version}</span>
                </div>
              </div>
            </div>

            {viewingForm.description && (
              <p className="text-gray-600">{viewingForm.description}</p>
            )}
          </div>
        </div>

        {/* Form Renderer - Ya tiene su propio max-w-4xl */}
        <FormRenderer form={viewingForm} />
      </div>
    )
  }

  return (
    <FormsList 
      sectionLocation={FormSectionType.PERFIL_COMUNITARIO} 
      locationName="Entrevistas PIMCO"
      onViewForm={setViewingForm}
    />
  )
}

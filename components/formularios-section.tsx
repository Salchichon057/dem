"use client"

import { useState } from "react"
import { FormsList, FormRenderer } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"

export function FormulariosSection() {
  const [viewingForm, setViewingForm] = useState<FormTemplateWithQuestions | null>(null)

  if (viewingForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewingForm(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-arrow-left text-gray-600"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{viewingForm.name}</h1>
                {viewingForm.description && (
                  <p className="text-gray-600 mt-1">{viewingForm.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <i className="far fa-question-circle text-blue-600"></i>
                <span>{viewingForm.questions?.length || 0} preguntas</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="far fa-clock text-blue-600"></i>
                <span>Versión {viewingForm.version}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${
              viewingForm.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {viewingForm.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <span className={`px-3 py-1 rounded-full ${
              viewingForm.is_public 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {viewingForm.is_public ? 'Público' : 'Privado'}
            </span>
          </div>
        </div>

        {/* Form Renderer */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <FormRenderer form={viewingForm} />
        </div>
      </div>
    )
  }

  return (
    <FormsList 
      sectionLocation={FormSectionType.ORGANIZACIONES} 
      locationName="Organizaciones"
      onViewForm={setViewingForm}
    />
  )
}

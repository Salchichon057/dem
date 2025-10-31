"use client";

import { useState } from "react";
import { FormsList, FormRenderer } from "@/components/form";
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types";

export function FormulariosSection() {
  const [viewingForm, setViewingForm] =
    useState<FormTemplateWithQuestions | null>(null);

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

        {/* Form Renderer - Ya tiene su propio max-w-4xl */}
        <FormRenderer form={viewingForm} />
      </div>
    );
  }

  return (
    <FormsList
      sectionLocation={FormSectionType.ORGANIZACIONES}
      locationName="Organizaciones"
      onViewForm={setViewingForm}
    />
  );
}

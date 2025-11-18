"use client"

import { useState } from "react"
import { ArrowLeft, FileText, Table as TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormsList, FormRenderer, FormBuilder } from "@/components/form"
import { FormSectionType, FormTemplateWithQuestions } from "@/lib/types"
import DynamicFormSubmissionsTable from "@/components/forms/dynamic-form-submissions-table"

type ViewMode = 'list' | 'view' | 'create' | 'edit';
type TabMode = 'forms' | 'data';

export function FormulariosAuditoriaSection() {
  const [tabMode, setTabMode] = useState<TabMode>('forms');
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
        <FormRenderer form={viewingForm} />
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
    <div className="space-y-6">
      {/* Header con título y descripción */}
      <div className="px-4 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Auditorías</h1>
        <p className="text-muted-foreground">
          Gestión de formularios y datos de auditorías
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b px-4 sm:px-6">
        <Button
          variant={tabMode === 'forms' ? 'default' : 'ghost'}
          onClick={() => setTabMode('forms')}
          className="gap-2"
        >
          <FileText className="w-5 h-5" />
          Formularios
        </Button>
        <Button
          variant={tabMode === 'data' ? 'default' : 'ghost'}
          onClick={() => setTabMode('data')}
          className="gap-2"
        >
          <TableIcon className="w-5 h-5" />
          Tabla de Datos
        </Button>
      </div>

      {/* Content based on selected tab */}
      <div className="px-4 sm:px-6">
        {tabMode === 'forms' ? (
          <FormsList 
            sectionLocation={FormSectionType.AUDITORIAS} 
            locationName="Auditorías"
            onViewForm={handleViewForm}
            onCreateForm={handleCreateForm}
            onEditForm={handleEditForm}
          />
        ) : (
          <DynamicFormSubmissionsTable
            sectionLocation="auditorias"
            sectionTitle="Auditorías"
          />
        )}
      </div>
    </div>
  )
}

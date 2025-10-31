'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, Edit, Trash2, Loader2, Search, Plus, AlertCircle, Inbox, Globe, Pause, FileText } from 'lucide-react'
import { authFetch } from '@/lib/auth-fetch'
import { FormSectionType, FormListResponse, FormTemplateWithQuestions } from '@/lib/types'

interface FormTemplate {
  id: string
  name: string
  description: string | null
  slug: string
  section_location: FormSectionType | null
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  submission_count: number
}

interface FormsListProps {
  sectionLocation: FormSectionType
  locationName?: string
  onViewForm?: (form: FormTemplateWithQuestions) => void
  onCreateForm?: () => void
  onEditForm?: (formId: string) => void
}

export default function FormsList({ sectionLocation, locationName, onViewForm, onCreateForm, onEditForm }: FormsListProps) {
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingFormId, setLoadingFormId] = useState<string | null>(null)

  useEffect(() => {
    async function loadForms() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await authFetch(`/api/formularios?section_location=${sectionLocation}`)
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('No autorizado. Por favor, inicia sesión nuevamente.')
          }
          throw new Error('Error al cargar formularios')
        }
        
        const data: FormListResponse = await response.json()
        // La API devuelve { forms: [...], total: number }
        const formsArray = data.forms || []
        setForms(Array.isArray(formsArray) ? formsArray : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setForms([])
      } finally {
        setLoading(false)
      }
    }

    loadForms()
  }, [sectionLocation])

  // Defensive programming: asegurar que forms sea un array
  const formsArray = Array.isArray(forms) ? forms : []
  
  const filteredForms = formsArray.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (formId: string, formName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el formulario "${formName}"?`)) {
      return
    }

    try {
      const response = await authFetch(`/api/formularios?id=${formId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar')
      }

      // Actualizar lista localmente
      setForms(forms.filter(f => f.id !== formId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar formulario')
    }
  }

  const handleViewForm = async (formId: string) => {
    if (!onViewForm) return
    
    try {
      setLoadingFormId(formId)
      
      const response = await authFetch(`/api/formularios/${formId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar el formulario')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        onViewForm(result.data)
      } else {
        throw new Error('No se pudo cargar el formulario')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cargar formulario')
    } finally {
      setLoadingFormId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#e6235a] mb-4 mx-auto animate-spin" />
          <p className="text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con buscador y botón nuevo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Formularios {locationName && `- ${locationName}`}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {forms.length} formulario{forms.length !== 1 ? 's' : ''} encontrado{forms.length !== 1 ? 's' : ''}
          </p>
        </div>

        {onCreateForm ? (
          <button
            onClick={onCreateForm}
            className="px-6 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] transition-colors font-medium shadow-md flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Formulario
          </button>
        ) : (
          <Link
            href={`/dashboard/formularios/new?section=${sectionLocation}`}
            className="px-6 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] transition-colors font-medium shadow-md flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Formulario
          </Link>
        )}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar formularios..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e6235a] focus:border-transparent"
        />
      </div>

      {/* Lista de formularios */}
      {filteredForms.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron formularios' : 'No hay formularios'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Crea tu primer formulario para comenzar'}
          </p>
          {!searchTerm && (
            <Link
              href={`/dashboard/formularios/new?section=${sectionLocation}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Crear Formulario
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => {
            const submissionCount = form.submission_count || 0
            const hasResponses = submissionCount > 0

            return (
              <div
                key={form.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header del card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
                      {form.name}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    {form.is_public && (
                      <span className="text-green-500" title="Público">
                        <Globe className="w-4 h-4" />
                      </span>
                    )}
                    {!form.is_active && (
                      <span className="text-gray-400" title="Inactivo">
                        <Pause className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#e6235a]" />
                    <span>{submissionCount} respuestas</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                  {/* Botón Ver */}
                  {onViewForm ? (
                    <button
                      onClick={() => handleViewForm(form.id)}
                      disabled={loadingFormId === form.id}
                      title="Ver formulario"
                      className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#e6235a] hover:text-[#e6235a] hover:bg-[#e6235a]/5 transition-all text-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingFormId === form.id ? (
                        <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                      ) : (
                        <Eye className="w-5 h-5 mx-auto" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/formularios/${form.id}/view`}
                      title="Ver formulario"
                      className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#e6235a] hover:text-[#e6235a] hover:bg-[#e6235a]/5 transition-all text-center text-sm font-medium inline-flex items-center justify-center"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  )}

                  {/* Botón Editar - Solo si no tiene respuestas */}
                  {!hasResponses ? (
                    onEditForm ? (
                      <button
                        onClick={() => onEditForm(form.id)}
                        title="Editar formulario"
                        className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#e6235a] hover:text-[#e6235a] hover:bg-[#e6235a]/5 transition-all text-center text-sm font-medium inline-flex items-center justify-center"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/formularios/${form.id}/edit?section=${sectionLocation}`}
                        title="Editar formulario"
                        className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#e6235a] hover:text-[#e6235a] hover:bg-[#e6235a]/5 transition-all text-center text-sm font-medium inline-flex items-center justify-center"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    )
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-400 rounded-lg text-center text-sm font-medium cursor-not-allowed inline-flex items-center justify-center" title="No se puede editar (tiene respuestas)">
                      <Edit className="w-5 h-5" />
                    </div>
                  )}

                  {/* Botón Eliminar - Solo si no tiene respuestas */}
                  {!hasResponses ? (
                    <button
                      onClick={() => handleDelete(form.id, form.name)}
                      title="Eliminar formulario"
                      className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium col-span-2"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-400 rounded-lg text-center text-sm font-medium cursor-not-allowed col-span-2 inline-flex items-center justify-center" title="No se puede eliminar (tiene respuestas)">
                      <Trash2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

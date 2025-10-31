'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
}

export default function FormsList({ sectionLocation, locationName, onViewForm }: FormsListProps) {
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

  const handleDuplicate = async (formId: string) => {
    try {
      const response = await authFetch(`/api/formularios/${formId}/duplicar`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al duplicar')
      }

      // Recargar lista
      const updatedResponse = await authFetch(`/api/formularios?section_location=${sectionLocation}`)
      const data: FormListResponse = await updatedResponse.json()
      const formsArray = data.forms || []
      setForms(Array.isArray(formsArray) ? formsArray : [])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al duplicar formulario')
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
          <i className="fa-solid fa-spinner fa-spin text-4xl text-[#e6235a] mb-4"></i>
          <p className="text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i className="fa-solid fa-exclamation-circle text-4xl text-red-500 mb-3"></i>
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

        <Link
          href={`/dashboard/formularios/new?section=${sectionLocation}`}
          className="px-6 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] transition-colors font-medium shadow-md"
        >
          <i className="fa-solid fa-plus-circle mr-2"></i>
          Nuevo Formulario
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative">
        <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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
          <i className="fa-solid fa-inbox text-6xl text-gray-300 mb-4"></i>
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
              className="inline-block px-6 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] transition-colors font-medium"
            >
              <i className="fa-solid fa-plus-circle mr-2"></i>
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
                        <i className="fa-solid fa-globe text-sm"></i>
                      </span>
                    )}
                    {!form.is_active && (
                      <span className="text-gray-400" title="Inactivo">
                        <i className="fa-solid fa-pause-circle text-sm"></i>
                      </span>
                    )}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="fa-solid fa-file-alt mr-2 text-[#e6235a]"></i>
                    <span>{submissionCount} respuestas</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {onViewForm ? (
                    <button
                      onClick={() => handleViewForm(form.id)}
                      disabled={loadingFormId === form.id}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingFormId === form.id ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                          Cargando...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-eye mr-1"></i>
                          Ver
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/formularios/${form.id}/view`}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center text-sm font-medium"
                    >
                      <i className="fa-solid fa-eye mr-1"></i>
                      Ver
                    </Link>
                  )}

                  {!hasResponses && (
                    <Link
                      href={`/dashboard/formularios/${form.id}/edit?section=${sectionLocation}`}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-center text-sm font-medium"
                    >
                      <i className="fa-solid fa-edit mr-1"></i>
                      Editar
                    </Link>
                  )}

                  <button
                    onClick={() => handleDuplicate(form.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    title="Duplicar"
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>

                  {!hasResponses && (
                    <button
                      onClick={() => handleDelete(form.id, form.name)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      title="Eliminar"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>

                {hasResponses && (
                  <p className="text-xs text-gray-500 mt-2 text-center italic">
                    No se puede editar/eliminar (tiene respuestas)
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

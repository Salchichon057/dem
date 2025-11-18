"use client"

import { useEffect, useState, useCallback } from 'react'
import { FormTemplate } from '@/lib/types'
import { toast } from 'sonner'

export interface FormListFilters {
  searchTerm?: string
  sectionLocation?: string
  isPublic?: boolean
}

export function useFormList(filters?: FormListFilters) {
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || '')
  const [loadingFormId, setLoadingFormId] = useState<string | null>(null)

  const loadForms = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filters?.sectionLocation) {
        params.append('section', filters.sectionLocation)
      }
      
      if (filters?.isPublic !== undefined) {
        params.append('is_public', String(filters.isPublic))
      }
      
      const response = await fetch(`/api/formularios?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar formularios')
      }
      
      const data = await response.json()
      setForms(data.forms || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [filters?.sectionLocation, filters?.isPublic])

  const deleteForm = useCallback(async (formId: string) => {
    setLoadingFormId(formId)
    
    try {
      const response = await fetch(`/api/formularios/${formId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar formulario')
      }
      
      setForms(prev => prev.filter(f => f.id !== formId))
      toast.success('Formulario eliminado correctamente')
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoadingFormId(null)
    }
  }, [])

  const duplicateForm = useCallback(async (formId: string) => {
    setLoadingFormId(formId)
    
    try {
      // TODO: Implementar duplicación de formulario
      toast.info('Función de duplicación en desarrollo')
      return { success: false }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al duplicar'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoadingFormId(null)
    }
  }, [])

  const toggleFormStatus = useCallback(async (formId: string, isPublic: boolean) => {
    setLoadingFormId(formId)
    
    try {
      // TODO: Implementar cambio de estado
      setForms(prev => 
        prev.map(f => f.id === formId ? { ...f, is_public: isPublic } : f)
      )
      
      toast.success(`Formulario ${isPublic ? 'publicado' : 'despublicado'}`)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoadingFormId(null)
    }
  }, [])

  const filteredForms = forms.filter(form => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    return (
      form.name.toLowerCase().includes(search) ||
      form.description?.toLowerCase().includes(search) ||
      form.slug.toLowerCase().includes(search)
    )
  })

  useEffect(() => {
    loadForms()
  }, [loadForms])

  return {
    forms: filteredForms,
    loading,
    error,
    searchTerm,
    loadingFormId,
    setSearchTerm,
    loadForms,
    deleteForm,
    duplicateForm,
    toggleFormStatus
  }
}

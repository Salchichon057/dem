import { useState, useCallback } from 'react'
import { FormSectionType, ExtrasType } from '@/lib/types'
import { fetchExtras, saveExtras, fetchMultipleExtras } from '@/lib/utils/extras.utils'
import { toast } from 'sonner'

export function useExtras<T extends ExtrasType>(sectionLocation: FormSectionType) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSingle = useCallback(
    async (submissionId: string): Promise<T | null> => {
      setLoading(true)
      try {
        const data = await fetchExtras<T>(sectionLocation, submissionId)
        return data
      } catch (error) {
        console.error('Error fetching extras:', error)
        toast.error('Error al cargar datos extras')
        return null
      } finally {
        setLoading(false)
      }
    },
    [sectionLocation]
  )

  const fetchMultiple = useCallback(
    async (submissionIds: string[]): Promise<Record<string, T>> => {
      setLoading(true)
      try {
        const data = await fetchMultipleExtras<T>(sectionLocation, submissionIds)
        return data
      } catch (error) {
        console.error('Error fetching multiple extras:', error)
        toast.error('Error al cargar datos extras')
        return {}
      } finally {
        setLoading(false)
      }
    },
    [sectionLocation]
  )

  const save = useCallback(
    async (data: Partial<T> & { submission_id: string }): Promise<boolean> => {
      setSaving(true)
      try {
        const result = await saveExtras<T>(sectionLocation, data)
        
        if (result.success) {
          toast.success('Datos extras guardados correctamente')
          return true
        } else {
          toast.error(result.error || 'Error al guardar datos extras')
          return false
        }
      } catch (error) {
        console.error('Error saving extras:', error)
        toast.error('Error al guardar datos extras')
        return false
      } finally {
        setSaving(false)
      }
    },
    [sectionLocation]
  )

  return {
    loading,
    saving,
    fetchSingle,
    fetchMultiple,
    save,
  }
}

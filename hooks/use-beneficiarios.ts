"use client"

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface Beneficiario {
  id: string
  name: string
  age: number
  gender: 'Masculino' | 'Femenino'
  dpi: string | null
  program: string
  photo_url: string | null
  admission_date: string
  is_active: boolean
  department: string
  municipality: string
  village: string | null
  address: string | null
  google_maps_url: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export function useBeneficiarios() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [loading, setLoading] = useState(false)

  const cargarBeneficiarios = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/beneficiaries')
      
      if (!response.ok) {
        throw new Error('Error al cargar beneficiarios')
      }
      
      const data = await response.json()
      setBeneficiarios(data.beneficiaries || [])
    } catch (error) {
      console.error('Error al cargar beneficiarios:', error)
      toast.error('Error al cargar beneficiarios')
    } finally {
      setLoading(false)
    }
  }, [])

  const agregarBeneficiario = useCallback(async (data: Omit<Beneficiario, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Error al agregar beneficiario')
      }
      
      const result = await response.json()
      const beneficiario = result.beneficiary
      
      setBeneficiarios(prev => [beneficiario, ...prev])
      toast.success('Beneficiario agregado correctamente')
      
      return { success: true, data: beneficiario }
    } catch (error) {
      console.error('Error al agregar beneficiario:', error)
      toast.error('Error al agregar beneficiario')
      return { success: false, error }
    }
  }, [])

  const actualizarBeneficiario = useCallback(async (id: string, updates: Partial<Beneficiario>) => {
    try {
      const response = await fetch(`/api/beneficiaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar beneficiario')
      }
      
      const result = await response.json()
      const beneficiario = result.beneficiary
      
      setBeneficiarios(prev => 
        prev.map(b => b.id === id ? beneficiario : b)
      )
      
      toast.success('Beneficiario actualizado correctamente')
      return { success: true, data: beneficiario }
    } catch (error) {
      console.error('Error al actualizar beneficiario:', error)
      toast.error('Error al actualizar beneficiario')
      return { success: false, error }
    }
  }, [])

  const eliminarBeneficiario = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/beneficiaries/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar beneficiario')
      }
      
      setBeneficiarios(prev => prev.filter(b => b.id !== id))
      
      toast.success('Beneficiario eliminado correctamente')
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar beneficiario:', error)
      toast.error('Error al eliminar beneficiario')
      return { success: false, error }
    }
  }, [])

  return {
    beneficiarios,
    loading,
    cargarBeneficiarios,
    agregarBeneficiario,
    actualizarBeneficiario,
    eliminarBeneficiario
  }
}

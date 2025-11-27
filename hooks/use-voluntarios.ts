"use client"

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export interface Voluntario {
  id: string
  name: string
  volunteer_type: 'Individual' | 'Comunidad' | 'ONG Aliada'
  organization: string | null
  shift: 'Diurno' | 'Nocturno'
  entry_time: string
  exit_time: string
  total_hours: number
  receives_benefit: boolean
  benefit_number: string | null
  agricultural_pounds: number | null
  unit_cost_q: number | null
  unit_cost_usd: number | null
  viveres_bags: number | null
  average_cost_30lbs: number | null
  picking_gtq: number | null
  picking_5lbs: number | null
  total_amount_q: number | null
  group_number: number | null
  department: string | null
  municipality: string | null
  village: string | null
  work_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export interface VoluntarioStats {
  total: number
  activos: number
  horasTotales: number
  promedioHoras: number
  nuevosEsteMes: number
  porTipo: {
    Individual: number
    Comunidad: number
    'ONG Aliada': number
  }
}

export interface VoluntariosFilters {
  searchTerm?: string
  volunteer_type?: string
  shift?: string
  is_active?: boolean
  page?: number
  limit?: number
}

export function useVoluntarios(filters?: VoluntariosFilters) {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [stats, setStats] = useState<VoluntarioStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(filters?.page || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const cargarVoluntarios = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters?.searchTerm) params.append('search', filters.searchTerm)
      if (filters?.volunteer_type) params.append('type', filters.volunteer_type)
      if (filters?.shift) params.append('shift', filters.shift)
      if (filters?.is_active !== undefined) params.append('active', String(filters.is_active))
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      
      const response = await fetch(`/api/volunteers?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar voluntarios')
      }
      
      const data = await response.json()
      
      setVoluntarios(data.volunteers || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setCurrentPage(data.page || 1)
    } catch {
      toast.error('Error al cargar voluntarios')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await fetch('/api/volunteers/stats')
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      
      const data = await response.json()
      setStats(data.stats)
    } catch {
    }
  }, [])

  const agregarVoluntario = useCallback(async (data: Omit<Voluntario, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Error al agregar voluntario')
      }
      
      const result = await response.json()
      const voluntario = result.volunteer
      
      setVoluntarios(prev => [voluntario, ...prev])
      toast.success('Voluntario agregado correctamente')
      
      return { success: true, data: voluntario }
    } catch {
      toast.error('Error al agregar voluntario')
      return { success: false }
    }
  }, [])

  const actualizarVoluntario = useCallback(async (id: string, updates: Partial<Voluntario>) => {
    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar voluntario')
      }
      
      const result = await response.json()
      const voluntario = result.volunteer
      
      setVoluntarios(prev => 
        prev.map(v => v.id === id ? voluntario : v)
      )
      
      toast.success('Voluntario actualizado correctamente')
      return { success: true, data: voluntario }
    } catch {
      toast.error('Error al actualizar voluntario')
      return { success: false }
    }
  }, [])

  const eliminarVoluntario = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar voluntario')
      }
      
      setVoluntarios(prev => prev.filter(v => v.id !== id))
      
      toast.success('Voluntario eliminado correctamente')
      return { success: true }
    } catch {
      toast.error('Error al eliminar voluntario')
      return { success: false }
    }
  }, [])

  useEffect(() => {
    cargarVoluntarios()
  }, [cargarVoluntarios])

  return {
    voluntarios,
    stats,
    loading,
    currentPage,
    totalPages,
    total,
    setCurrentPage,
    cargarVoluntarios,
    cargarEstadisticas,
    agregarVoluntario,
    actualizarVoluntario,
    eliminarVoluntario
  }
}



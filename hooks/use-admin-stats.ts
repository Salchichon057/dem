"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AdminGeneralStats {
  forms_organizaciones: number
  forms_auditorias: number
  forms_perfil_comunitario: number
  forms_voluntariado: number
  forms_comunidades: number
  forms_abrazando_leyendas: number
  total_forms: number
  
  submissions_organizaciones: number
  submissions_auditorias: number
  submissions_perfil_comunitario: number
  submissions_voluntariado: number
  submissions_comunidades: number
  submissions_abrazando_leyendas: number
  total_submissions: number
  
  total_beneficiaries: number
  total_volunteers: number
  total_users: number
  total_admins: number
  total_editors: number
  total_viewers: number
}

export interface SectionStats {
  section: string
  section_name: string
  forms_count: number
  submissions_count: number
}

export function useAdminStats() {
  const [generalStats, setGeneralStats] = useState<AdminGeneralStats | null>(null)
  const [sectionStats, setSectionStats] = useState<SectionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      
      try {
        const [generalResult, sectionsResult] = await Promise.all([
          supabase.from('admin_general_stats').select('*').single(),
          supabase.from('admin_section_stats').select('*')
        ])

        if (generalResult.error) throw generalResult.error
        if (sectionsResult.error) throw sectionsResult.error

        setGeneralStats(generalResult.data as AdminGeneralStats)
        setSectionStats(sectionsResult.data as SectionStats[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    generalStats,
    sectionStats,
    loading,
    error
  }
}

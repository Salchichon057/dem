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
  // total_volunteers: number // No en v1
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

const SECTION_NAMES: Record<string, string> = {
  'organizaciones': 'Organizaciones',
  'auditorias': 'Auditorías',
  'perfil-comunitario': 'Perfil Comunitario',
  'voluntariado': 'Voluntariado',
  'comunidades': 'Comunidades',
  'abrazando-leyendas': 'Abrazando Leyendas'
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
        // Contar formularios por sección (activos + inactivos, excluye eliminados)
        const { data: allForms, error: formsError } = await supabase
          .from('form_templates')
          .select('section_location, is_active')
          .is('deleted_at', null)

        if (formsError) throw formsError

        const formsBySection = {
          organizaciones: 0,
          auditorias: 0,
          'perfil-comunitario': 0,
          voluntariado: 0,
          comunidades: 0,
          'abrazando-leyendas': 0
        }

        allForms?.forEach((form) => {
          if (form.section_location && form.section_location in formsBySection) {
            formsBySection[form.section_location as keyof typeof formsBySection]++
          }
        })

        // Contar respuestas por sección (submissions)
        const [
          { count: orgSubs },
          { count: auditSubs },
          { count: profileSubs },
          { count: volSubs },
          { count: commSubs },
          { count: legendsSubs }
        ] = await Promise.all([
          supabase.from('organizations_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('audits_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('community_profile_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('volunteer_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('communities_submissions').select('*', { count: 'exact', head: true }),
          supabase.from('embracing_legends_submissions').select('*', { count: 'exact', head: true })
        ])

        // Contar beneficiarios, usuarios (voluntarios no en v1)
        const [
          { count: beneficiaries },
          // { count: volunteers }, // No en v1
          { data: users }
        ] = await Promise.all([
          supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('is_active', true),
          // supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('is_active', true), // No en v1
          supabase.from('users').select('role_id, roles!inner(name)').eq('is_active', true)
        ])

        // Contar usuarios por rol
        const adminCount = users?.filter((u) => {
          const role = Array.isArray(u.roles) ? u.roles[0] : u.roles
          return role?.name === 'admin'
        }).length || 0

        const editorCount = users?.filter((u) => {
          const role = Array.isArray(u.roles) ? u.roles[0] : u.roles
          return role?.name === 'editor'
        }).length || 0

        const viewerCount = users?.filter((u) => {
          const role = Array.isArray(u.roles) ? u.roles[0] : u.roles
          return role?.name === 'viewer'
        }).length || 0

        const totalSubs = (orgSubs || 0) + (auditSubs || 0) + (profileSubs || 0) + 
                         (volSubs || 0) + (commSubs || 0) + (legendsSubs || 0)

        // Construir generalStats
        const stats: AdminGeneralStats = {
          forms_organizaciones: formsBySection.organizaciones,
          forms_auditorias: formsBySection.auditorias,
          forms_perfil_comunitario: formsBySection['perfil-comunitario'],
          forms_voluntariado: formsBySection.voluntariado,
          forms_comunidades: formsBySection.comunidades,
          forms_abrazando_leyendas: formsBySection['abrazando-leyendas'],
          total_forms: allForms?.length || 0,
          
          submissions_organizaciones: orgSubs || 0,
          submissions_auditorias: auditSubs || 0,
          submissions_perfil_comunitario: profileSubs || 0,
          submissions_voluntariado: volSubs || 0,
          submissions_comunidades: commSubs || 0,
          submissions_abrazando_leyendas: legendsSubs || 0,
          total_submissions: totalSubs,
          
          total_beneficiaries: beneficiaries || 0,
          // total_volunteers: volunteers || 0, // No en v1
          total_users: users?.length || 0,
          total_admins: adminCount,
          total_editors: editorCount,
          total_viewers: viewerCount
        }

        // Construir sectionStats
        const sections: SectionStats[] = Object.entries(SECTION_NAMES).map(([section, section_name]) => ({
          section,
          section_name,
          forms_count: formsBySection[section as keyof typeof formsBySection],
          submissions_count: 
            section === 'organizaciones' ? (orgSubs || 0) :
            section === 'auditorias' ? (auditSubs || 0) :
            section === 'perfil-comunitario' ? (profileSubs || 0) :
            section === 'voluntariado' ? (volSubs || 0) :
            section === 'comunidades' ? (commSubs || 0) :
            section === 'abrazando-leyendas' ? (legendsSubs || 0) : 0
        }))

        setGeneralStats(stats)
        setSectionStats(sections)
      } catch (err) {
        console.error('Error fetching stats:', err)
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

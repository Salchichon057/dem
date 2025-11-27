/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { VolunteerStats } from '@/lib/types'

/**
 * GET /api/volunteers/stats
 * Obtiene estadísticas de voluntarios
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await withAuth()
    if (error) return error

    // Obtener todos los voluntarios no eliminados
    const { data: volunteers, error: queryError } = await supabase
      .from('volunteers')
      .select('*')
      .is('deleted_at', null)

    if (queryError) throw queryError

    if (!volunteers || volunteers.length === 0) {
      return NextResponse.json({
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          total_hours: 0,
          total_with_benefit: 0,
          by_type: {},
          by_organization: {},
          by_shift: {},
          by_date: {}
        } as VolunteerStats
      })
    }

    // Calcular estadísticas
    const total = volunteers.length
    const active = volunteers.filter(v => v.is_active).length
    const inactive = total - active
    const total_hours = volunteers.reduce((sum, v) => sum + (v.total_hours || 0), 0)
    const total_with_benefit = volunteers.filter(v => v.receives_benefit).length

    // Por tipo
    const by_type: Record<string, number> = {}
    volunteers.forEach(v => {
      by_type[v.volunteer_type] = (by_type[v.volunteer_type] || 0) + 1
    })

    // Por organización
    const by_organization: Record<string, number> = {}
    volunteers.forEach(v => {
      if (v.organization) {
        by_organization[v.organization] = (by_organization[v.organization] || 0) + 1
      }
    })

    // Por turno
    const by_shift: Record<string, number> = {}
    volunteers.forEach(v => {
      by_shift[v.shift] = (by_shift[v.shift] || 0) + 1
    })

    // Por fecha
    const by_date: Record<string, { volunteers: number, hours: number }> = {}
    volunteers.forEach(v => {
      const date = v.work_date
      if (!by_date[date]) {
        by_date[date] = { volunteers: 0, hours: 0 }
      }
      by_date[date].volunteers++
      by_date[date].hours += v.total_hours || 0
    })

    const stats: VolunteerStats = {
      total,
      active,
      inactive,
      total_hours,
      total_with_benefit,
      by_type,
      by_organization,
      by_shift,
      by_date
    }

    return NextResponse.json({ stats })

  } catch {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}



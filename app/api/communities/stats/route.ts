/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'

/**
 * GET /api/communities/stats
 * Obtiene estadísticas generales de comunidades
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    // Total de comunidades activas
    const { count: total } = await supabase
      .from('communities')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Comunidades activas
    const { count: active } = await supabase
      .from('communities')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('status', 'activa')

    // Comunidades inactivas
    const { count: inactive } = await supabase
      .from('communities')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('status', 'inactiva')

    // Comunidades suspendidas
    const { count: suspended } = await supabase
      .from('communities')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('status', 'suspendida')

    // Por departamento
    const { data: byDepartment } = await supabase
      .from('communities')
      .select('department')
      .is('deleted_at', null)

    const departmentCounts = (byDepartment || []).reduce((acc: any, item) => {
      acc[item.department] = (acc[item.department] || 0) + 1
      return acc
    }, {})

    const by_department = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count: count as number
    }))

    // Por clasificación
    const { data: byClassification } = await supabase
      .from('communities')
      .select('classification')
      .is('deleted_at', null)
      .not('classification', 'is', null)

    const classificationCounts = (byClassification || []).reduce((acc: any, item) => {
      acc[item.classification] = (acc[item.classification] || 0) + 1
      return acc
    }, {})

    const by_classification = Object.entries(classificationCounts).map(([classification, count]) => ({
      classification,
      count: count as number
    }))

    // Total de familias
    const { data: familiesData } = await supabase
      .from('communities')
      .select('total_families, families_in_ra')
      .is('deleted_at', null)

    const total_families = (familiesData || []).reduce((sum, item) => sum + (item.total_families || 0), 0)
    const total_families_in_ra = (familiesData || []).reduce((sum, item) => sum + (item.families_in_ra || 0), 0)

    return NextResponse.json({
      total: total || 0,
      active: active || 0,
      inactive: inactive || 0,
      suspended: suspended || 0,
      by_department,
      by_classification,
      total_families,
      total_families_in_ra
    })

  } catch {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}



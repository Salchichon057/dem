/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { BeneficiaryStats } from '@/lib/types'

/**
 * GET /api/beneficiaries/stats
 * Obtiene estadísticas de beneficiarios para gráficos
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await withAuth()
    if (error) return error

    // Obtener todos los beneficiarios no eliminados
    const { data: beneficiaries, error: fetchError } = await supabase
      .from('beneficiaries')
      .select('*')
      .is('deleted_at', null)

    if (fetchError) throw fetchError

    if (!beneficiaries || beneficiaries.length === 0) {
      return NextResponse.json({
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          by_gender: { masculino: 0, femenino: 0 },
          by_department: {},
          by_department_details: {},
          by_program: {},
          average_age: 0
        } as BeneficiaryStats
      })
    }

    // Calcular estadísticas
    const total = beneficiaries.length
    const active = beneficiaries.filter(b => b.is_active).length
    const inactive = total - active

    // Por género
    const masculino = beneficiaries.filter(b => b.gender === 'Masculino').length
    const femenino = beneficiaries.filter(b => b.gender === 'Femenino').length

    // Por departamento
    const by_department: Record<string, number> = {}
    beneficiaries.forEach(b => {
      by_department[b.department] = (by_department[b.department] || 0) + 1
    })

    // Por departamento con detalles (género y programa)
    const by_department_details: Record<string, any> = {}
    beneficiaries.forEach(b => {
      if (!by_department_details[b.department]) {
        by_department_details[b.department] = {
          total: 0,
          masculino: 0,
          femenino: 0,
          programs: {} // Desglose dinámico por programa
        }
      }
      by_department_details[b.department].total++
      
      // Contar por género
      if (b.gender === 'Masculino') {
        by_department_details[b.department].masculino++
      } else if (b.gender === 'Femenino') {
        by_department_details[b.department].femenino++
      }
      
      // Contar por programa (dinámico)
      const program = b.program
      if (!by_department_details[b.department].programs[program]) {
        by_department_details[b.department].programs[program] = 0
      }
      by_department_details[b.department].programs[program]++
    })

    // Por programa
    const by_program: Record<string, number> = {}
    beneficiaries.forEach(b => {
      by_program[b.program] = (by_program[b.program] || 0) + 1
    })

    // Edad promedio
    const total_age = beneficiaries.reduce((sum, b) => sum + b.age, 0)
    const average_age = Math.round(total_age / total)

    const stats: BeneficiaryStats = {
      total,
      active,
      inactive,
      by_gender: {
        masculino,
        femenino
      },
      by_department,
      by_department_details,
      by_program,
      average_age
    }

    return NextResponse.json({ stats })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

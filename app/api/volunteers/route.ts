/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { Volunteer } from '@/lib/types'

/**
 * GET /api/volunteers
 * Obtiene la lista de voluntarios con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Parámetros de filtro
    const search = searchParams.get('search')
    const volunteer_type = searchParams.get('volunteer_type')
    const organization = searchParams.get('organization')
    const shift = searchParams.get('shift')
    const is_active = searchParams.get('is_active')
    const work_date = searchParams.get('work_date')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    // Construir query base
    let query = supabase
      .from('volunteers')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (volunteer_type && volunteer_type !== 'all') {
      query = query.eq('volunteer_type', volunteer_type)
    }

    if (organization && organization !== 'all') {
      query = query.eq('organization', organization)
    }

    if (shift && shift !== 'all') {
      query = query.eq('shift', shift)
    }

    if (is_active !== null && is_active !== 'all') {
      query = query.eq('is_active', is_active === 'active')
    }

    if (work_date) {
      query = query.eq('work_date', work_date)
    }

    // Filtros de fecha por año y mes (created_at)
    if (year && year !== 'all') {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('created_at', startDate).lte('created_at', endDate)
      
      if (month && month !== 'all') {
        const monthPadded = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const startMonth = `${year}-${monthPadded}-01`
        const endMonth = `${year}-${monthPadded}-${lastDay}`
        query = query.gte('created_at', startMonth).lte('created_at', endMonth)
      }
    }

    // Ejecutar query con paginación
    const { data: volunteers, error: queryError, count } = await query.range(from, to)

    if (queryError) throw queryError

    return NextResponse.json({
      volunteers: volunteers as Volunteer[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error: any) {
    console.error('Error al obtener voluntarios:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener voluntarios' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/volunteers
 * Crea un nuevo voluntario
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await withAuth()
    if (error) return error

    const body = await request.json()

    // Validar campos requeridos
    const requiredFields = ['name', 'volunteer_type', 'shift', 'entry_time', 'exit_time', 'total_hours', 'work_date']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        )
      }
    }

    // Insertar voluntario
    const { data: volunteer, error: insertError } = await supabase
      .from('volunteers')
      .insert([{
        name: body.name,
        volunteer_type: body.volunteer_type,
        organization: body.organization || null,
        shift: body.shift,
        entry_time: body.entry_time,
        exit_time: body.exit_time,
        total_hours: body.total_hours,
        receives_benefit: body.receives_benefit || false,
        benefit_number: body.benefit_number || null,
        agricultural_pounds: body.agricultural_pounds || 0,
        unit_cost_q: body.unit_cost_q || null,
        unit_cost_usd: body.unit_cost_usd || null,
        viveres_bags: body.viveres_bags || null,
        average_cost_30lbs: body.average_cost_30lbs || null,
        picking_gtq: body.picking_gtq || null,
        picking_5lbs: body.picking_5lbs || null,
        total_amount_q: body.total_amount_q || null,
        group_number: body.group_number || null,
        department: body.department || null,
        municipality: body.municipality || null,
        village: body.village || null,
        work_date: body.work_date,
        is_active: body.is_active !== undefined ? body.is_active : true,
        created_by: user.id,
      }])
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(volunteer, { status: 201 })

  } catch (error: any) {
    console.error('Error al crear voluntario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear voluntario' },
      { status: 500 }
    )
  }
}

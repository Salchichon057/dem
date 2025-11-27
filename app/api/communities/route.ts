/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { CommunityFilters, CreateCommunityInput } from '@/lib/types/community'

/**
 * GET /api/communities
 * Lista comunidades con filtros opcionales y paginación
 * Query params: department, municipality, is_active, classification, search, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const filters: CommunityFilters = {
      department: searchParams.get('department') || undefined,
      municipality: searchParams.get('municipality') || undefined,
      status: searchParams.get('status') as 'activa' | 'inactiva' | 'suspendida' | undefined,
      classification: searchParams.get('classification') || undefined,
      search: searchParams.get('search') || undefined
    }

    // Parámetros de fecha
    const year = searchParams.get('year') || undefined
    const month = searchParams.get('month') || undefined

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // Primero obtenemos el count total
    let countQuery = supabase
      .from('communities')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Aplicar filtros al count
    if (filters.department) {
      countQuery = countQuery.eq('department', filters.department)
    }
    if (filters.municipality) {
      countQuery = countQuery.eq('municipality', filters.municipality)
    }
    if (filters.status) {
      countQuery = countQuery.eq('status', filters.status)
    }
    if (filters.classification) {
      countQuery = countQuery.eq('classification', filters.classification)
    }
    if (filters.search) {
      countQuery = countQuery.or(`villages.ilike.%${filters.search}%,leader_name.ilike.%${filters.search}%`)
    }
    
    // Filtros de fecha por año y mes (created_at)
    if (year && year !== 'all') {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      countQuery = countQuery.gte('created_at', startDate).lte('created_at', endDate)
      
      if (month && month !== 'all') {
        const monthPadded = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const startMonth = `${year}-${monthPadded}-01`
        const endMonth = `${year}-${monthPadded}-${lastDay}`
        countQuery = countQuery.gte('created_at', startMonth).lte('created_at', endMonth)
      }
    }

    const { count, error: countError } = await countQuery
    if (countError) throw countError

    // Ahora obtenemos los datos paginados
    let query = supabase
      .from('communities')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to)

    // Aplicar filtros
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.municipality) {
      query = query.eq('municipality', filters.municipality)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.classification) {
      query = query.eq('classification', filters.classification)
    }
    if (filters.search) {
      query = query.or(`villages.ilike.%${filters.search}%,leader_name.ilike.%${filters.search}%`)
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

    const { data: communities, error } = await query
    if (error) throw error

    return NextResponse.json({
      communities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { error: 'Error al obtener comunidades', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/communities
 * Crear nueva comunidad
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await withAuth()
    if (authError) return authError

    const body: CreateCommunityInput = await request.json()

    // Validaciones básicas
    if (!body.department || !body.municipality) {
      return NextResponse.json(
        { error: 'Department y Municipality son requeridos' },
        { status: 400 }
      )
    }

    const newCommunity = {
      ...body,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: community, error } = await supabase
      .from('communities')
      .insert(newCommunity)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ community }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Error creating community:', error)
    return NextResponse.json(
      { error: 'Error al crear comunidad', details: error.message },
      { status: 500 }
    )
  }
}

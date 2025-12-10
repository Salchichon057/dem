import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { Beneficiary, BeneficiaryFilters, CreateBeneficiaryInput } from '@/lib/types'

/**
 * GET /api/beneficiaries
 * Lista beneficiarios con filtros opcionales y paginación
 * Query params: department, municipality, program, is_active, search, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const filters: BeneficiaryFilters = {
      department: searchParams.get('department') || undefined,
      municipality: searchParams.get('municipality') || undefined,
      program: searchParams.get('program') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
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
      .from('beneficiaries')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Aplicar filtros al count
    if (filters.department) {
      countQuery = countQuery.eq('department', filters.department)
    }
    if (filters.municipality) {
      countQuery = countQuery.eq('municipality', filters.municipality)
    }
    if (filters.program) {
      countQuery = countQuery.eq('program', filters.program)
    }
    if (filters.is_active !== undefined) {
      countQuery = countQuery.eq('is_active', filters.is_active)
    }
    if (filters.search) {
      countQuery = countQuery.ilike('name', `%${filters.search}%`)
    }
    
    // Filtros de fecha por año y mes (admission_date)
    if (year && year !== 'all') {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      countQuery = countQuery.gte('admission_date', startDate).lte('admission_date', endDate)
      
      if (month && month !== 'all') {
        const monthPadded = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const startMonth = `${year}-${monthPadded}-01`
        const endMonth = `${year}-${monthPadded}-${lastDay}`
        countQuery = countQuery.gte('admission_date', startMonth).lte('admission_date', endMonth)
      }
    }

    const { count, error: countError } = await countQuery
    if (countError) throw countError

    // Ahora obtenemos los datos paginados
    let query = supabase
      .from('beneficiaries')
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
    if (filters.program) {
      query = query.eq('program', filters.program)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    
    // Filtros de fecha por año y mes (admission_date)
    if (year && year !== 'all') {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('admission_date', startDate).lte('admission_date', endDate)
      
      if (month && month !== 'all') {
        const monthPadded = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const startMonth = `${year}-${monthPadded}-01`
        const endMonth = `${year}-${monthPadded}-${lastDay}`
        query = query.gte('admission_date', startMonth).lte('admission_date', endMonth)
      }
    }

    const { data: beneficiaries, error } = await query
    if (error) throw error

    return NextResponse.json({
      beneficiaries: beneficiaries as Beneficiary[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch {
    return NextResponse.json(
      { error: 'Error al obtener beneficiarios' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/beneficiaries
 * Crea un nuevo beneficiario
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await withAuth()
    if (authError) return authError

    const body = await request.json() as CreateBeneficiaryInput
    
    // Validaciones básicas
    if (!body.name || !body.age || !body.gender || !body.program || 
        !body.admission_date || !body.department || !body.municipality) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, age, gender, program, admission_date, department, municipality' },
        { status: 400 }
      )
    }

    if (body.age <= 0 || body.age > 120) {
      return NextResponse.json(
        { error: 'La edad debe estar entre 1 y 120 años' },
        { status: 400 }
      )
    }

    if (!['Masculino', 'Femenino'].includes(body.gender)) {
      return NextResponse.json(
        { error: 'El género debe ser Masculino o Femenino' },
        { status: 400 }
      )
    }

    const { data: beneficiary, error } = await supabase
      .from('beneficiaries')
      .insert({
        name: body.name,
        age: body.age,
        gender: body.gender,
        dpi: body.dpi || null,
        program: body.program,
        photo_url: body.photo_url || null,
        admission_date: body.admission_date,
        is_active: body.is_active ?? true,
        department: body.department,
        municipality: body.municipality,
        village: body.village || null,
        address: body.address || null,
        google_maps_url: body.google_maps_url || null,
        personal_contact: body.personal_contact || null,
        personal_number: body.personal_number || null,
        community_contact: body.community_contact || null,
        community_number: body.community_number || null,
        bag: body.bag || null,
        created_by: user.id  // ID del usuario autenticado
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      beneficiary
    }, { status: 201 })

  } catch {
    return NextResponse.json(
      { error: 'Error al crear beneficiario' },
      { status: 500 }
    )
  }
}



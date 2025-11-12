/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import type { Beneficiary, BeneficiaryFilters, CreateBeneficiaryInput } from '@/lib/types'

/**
 * GET /api/beneficiaries
 * Lista beneficiarios con filtros opcionales
 * Query params: department, municipality, program, is_active, search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters: BeneficiaryFilters = {
      department: searchParams.get('department') || undefined,
      municipality: searchParams.get('municipality') || undefined,
      program: searchParams.get('program') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined
    }

    const supabase = createClient()
    let query = supabase
      .from('beneficiaries')
      .select('*')
      .is('deleted_at', null) // Solo no eliminados
      .order('created_at', { ascending: false })

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

    const { data: beneficiaries, error } = await query

    if (error) throw error

    return NextResponse.json({
      beneficiaries: beneficiaries as Beneficiary[],
      total: beneficiaries?.length || 0
    })

  } catch (error: any) {
    console.error('Error al obtener beneficiarios:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener beneficiarios' },
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

    const supabase = createClient()

    // TODO: Obtener user_id del usuario autenticado
    const created_by = '4157e293-5629-4369-bcdb-5a0197596e3c' // Hardcoded por ahora

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
        is_active: body.is_active ?? true, // Default true
        department: body.department,
        municipality: body.municipality,
        village: body.village || null,
        address: body.address || null,
        google_maps_url: body.google_maps_url || null,
        created_by
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      beneficiary
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error al crear beneficiario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear beneficiario' },
      { status: 500 }
    )
  }
}

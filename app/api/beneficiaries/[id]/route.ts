/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { UpdateBeneficiaryInput } from '@/lib/types'

/**
 * GET /api/beneficiaries/[id]
 * Obtiene un beneficiario por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, error } = await withAuth()
    if (error) return error

    const { id } = await params

    const { data: beneficiary, error: dbError } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Beneficiario no encontrado' },
          { status: 404 }
        )
      }
      throw dbError
    }

    return NextResponse.json({ beneficiary })

  } catch (error: any) {
    console.error('Error al obtener beneficiario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener beneficiario' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/beneficiaries/[id]
 * Actualiza un beneficiario
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, error } = await withAuth()
    if (error) return error

    const { id } = await params
    const body = await request.json() as Partial<UpdateBeneficiaryInput>

    // Validaciones
    if (body.age !== undefined && (body.age <= 0 || body.age > 120)) {
      return NextResponse.json(
        { error: 'La edad debe estar entre 1 y 120 años' },
        { status: 400 }
      )
    }

    if (body.gender && !['Masculino', 'Femenino'].includes(body.gender)) {
      return NextResponse.json(
        { error: 'El género debe ser Masculino o Femenino' },
        { status: 400 }
      )
    }

    // Verificar que el beneficiario existe
    const { data: existing } = await supabase
      .from('beneficiaries')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Beneficiario no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.age !== undefined) updateData.age = body.age
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.dpi !== undefined) updateData.dpi = body.dpi
    if (body.program !== undefined) updateData.program = body.program
    if (body.photo_url !== undefined) updateData.photo_url = body.photo_url
    if (body.admission_date !== undefined) updateData.admission_date = body.admission_date
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.department !== undefined) updateData.department = body.department
    if (body.municipality !== undefined) updateData.municipality = body.municipality
    if (body.village !== undefined) updateData.village = body.village
    if (body.address !== undefined) updateData.address = body.address
    if (body.google_maps_url !== undefined) updateData.google_maps_url = body.google_maps_url
    if (body.personal_contact !== undefined) updateData.personal_contact = body.personal_contact
    if (body.personal_number !== undefined) updateData.personal_number = body.personal_number
    if (body.community_contact !== undefined) updateData.community_contact = body.community_contact
    if (body.community_number !== undefined) updateData.community_number = body.community_number

    // Actualizar (updated_at se actualiza automáticamente por trigger)
    const { data: beneficiary, error: updateError } = await supabase
      .from('beneficiaries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      beneficiary
    })

  } catch (error: any) {
    console.error('❌ Error al actualizar beneficiario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar beneficiario' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/beneficiaries/[id]
 * Soft delete de un beneficiario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, error } = await withAuth()
    if (error) return error

    const { id } = await params

    // Verificar que existe
    const { data: existing } = await supabase
      .from('beneficiaries')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Beneficiario no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete: marcar deleted_at
    const { error: deleteError } = await supabase
      .from('beneficiaries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Beneficiario eliminado correctamente'
    })

  } catch (error: any) {
    console.error('❌ Error al eliminar beneficiario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar beneficiario' },
      { status: 500 }
    )
  }
}

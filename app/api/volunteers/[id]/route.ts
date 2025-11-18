/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'

/**
 * GET /api/volunteers/[id]
 * Obtiene un voluntario por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { id } = await params

    const { data: volunteer, error: queryError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (queryError) throw queryError

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(volunteer)

  } catch (error: any) {
    console.error('Error al obtener voluntario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener voluntario' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/volunteers/[id]
 * Actualiza un voluntario
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const body = await request.json()
    const { id } = await params

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Campos permitidos para actualizar
    const allowedFields = [
      'name', 'volunteer_type', 'organization', 'shift',
      'entry_time', 'exit_time', 'total_hours', 'receives_benefit',
      'benefit_number', 'agricultural_pounds', 'unit_cost_q', 'unit_cost_usd',
      'viveres_bags', 'average_cost_30lbs', 'picking_gtq', 'picking_5lbs',
      'total_amount_q', 'group_number', 'department', 'municipality',
      'village', 'work_date', 'is_active'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const { data: volunteer, error: updateError } = await supabase
      .from('volunteers')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (updateError) throw updateError

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(volunteer)

  } catch (error: any) {
    console.error('Error al actualizar voluntario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar voluntario' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/volunteers/[id]
 * Elimina un voluntario (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { id } = await params

    // Soft delete
    const { data: volunteer, error: deleteError } = await supabase
      .from('volunteers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (deleteError) throw deleteError

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Voluntario eliminado correctamente' })

  } catch (error: any) {
    console.error('Error al eliminar voluntario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar voluntario' },
      { status: 500 }
    )
  }
}

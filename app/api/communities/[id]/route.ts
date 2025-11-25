/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { UpdateCommunityInput } from '@/lib/types/community'

/**
 * GET /api/communities/[id]
 * Obtiene una comunidad por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { id } = params

    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    if (!community) {
      return NextResponse.json(
        { error: 'Comunidad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ community })

  } catch (error: any) {
    console.error('❌ Error fetching community:', error)
    return NextResponse.json(
      { error: 'Error al obtener comunidad', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/communities/[id]
 * Actualiza una comunidad
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError
 
    const { id } = params
    const body: UpdateCommunityInput = await request.json()

    // Remover el ID del body si viene
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = body

    const updatedCommunity = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data: community, error } = await supabase
      .from('communities')
      .update(updatedCommunity)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error

    if (!community) {
      return NextResponse.json(
        { error: 'Comunidad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ community })

  } catch (error: any) {
    console.error('❌ Error updating community:', error)
    return NextResponse.json(
      { error: 'Error al actualizar comunidad', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/communities/[id]
 * Elimina (soft delete) una comunidad
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { id } = params

    const { error } = await supabase
      .from('communities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)

    if (error) throw error

    return NextResponse.json({ message: 'Comunidad eliminada correctamente' })

  } catch (error: any) {
    console.error('❌ Error deleting community:', error)
    return NextResponse.json(
      { error: 'Error al eliminar comunidad', details: error.message },
      { status: 500 }
    )
  }
}

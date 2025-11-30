import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'

/**
 * DELETE /api/community-profile-links/[id]
 * Remove a community from Community Profile (soft delete - sets is_active = false)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await withAuth()
  if (authError) return authError

  try {
    const { id } = await params

    // Soft delete - just deactivate
    const { error } = await supabase
      .from('community_profile_links')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting community profile link:', error)
      return NextResponse.json(
        { error: 'Error al eliminar vínculo', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vínculo eliminado exitosamente'
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/community-profile-links/[id]:', error)
    return NextResponse.json(
      { error: 'Error inesperado al eliminar vínculo' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/community-profile-links/[id]
 * Update a community profile link (notes, reactivate, etc.)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await withAuth()
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()

    const { is_active, notes } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { error } = await supabase
      .from('community_profile_links')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating community profile link:', error)
      return NextResponse.json(
        { error: 'Error al actualizar vínculo', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Vínculo actualizado exitosamente'
    })

  } catch (error) {
    console.error('Unexpected error in PUT /api/community-profile-links/[id]:', error)
    return NextResponse.json(
      { error: 'Error inesperado al actualizar vínculo' },
      { status: 500 }
    )
  }
}

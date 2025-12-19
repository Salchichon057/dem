import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { SectionKey } from '@/lib/types/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { supabase, error } = await withAuth()
    if (error) return error

    const { userId } = await params

    const { data: permissions, error: permError } = await supabase
      .from('user_section_permissions')
      .select('*')
      .eq('user_id', userId)

    if (permError) {
      return NextResponse.json({ error: permError.message }, { status: 500 })
    }

    return NextResponse.json({ permissions: permissions || [] })
  } catch (error) {
    console.error('Error fetching section permissions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { supabase, user, error } = await withAuth()
    if (error) return error

    const { userId } = await params
    const body = await request.json()
    const { sectionKeys }: { sectionKeys: SectionKey[] } = body

    console.log('Updating section permissions:', { userId, sectionKeys })

    // Eliminar permisos existentes
    const { error: deleteError } = await supabase
      .from('user_section_permissions')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting existing permissions:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Insertar nuevos permisos
    if (sectionKeys.length > 0) {
      const newPermissions = sectionKeys.map(sectionKey => ({
        user_id: userId,
        section_key: sectionKey,
        created_by: user.id
      }))

      const { error: insertError } = await supabase
        .from('user_section_permissions')
        .insert(newPermissions)

      if (insertError) {
        console.error('Error inserting new permissions:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating section permissions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

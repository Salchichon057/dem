import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import type { SectionKey, UserWithPermissions } from '@/lib/types/permissions'

export async function GET() {
  try {
    const { supabase, user, error } = await withAuth()
    if (error) return error

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        is_active,
        role:roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.role) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Asegurar que role no sea un array y tiene created_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleData: any = Array.isArray(userData.role) ? userData.role[0] : userData.role
    const userRole = {
      id: roleData.id,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      created_at: roleData.created_at || new Date().toISOString()
    }

    let allowedSections: SectionKey[] = []

    // Admin tiene acceso a todo
    if (userRole.name === 'admin') {
      allowedSections = [
        'pimco-comunidades',
        'pimco-estadistica',
        'pimco-formularios',
        'pimco-diagnostico-comunitario',
        'organizaciones-estadistica',
        'organizaciones-formularios',
        'comunidades-lista',
        'comunidades-estadistica',
        'comunidades-formularios',
        'comunidades-plantillas',
        'auditorias-estadistica',
        'auditorias-formularios',
        'auditorias-tablero-consolidado',
        'auditorias-semaforo',
        'abrazando-leyendas',
        'voluntariado-estadistica',
        'voluntariado-formularios',
        'voluntariado-tablero',
        'admin-panel'
      ]
    } else {
      // Editor/Viewer obtienen sus secciones permitidas
      const { data: sectionPermissions } = await supabase
        .from('user_section_permissions')
        .select('section_key')
        .eq('user_id', user.id)

      allowedSections = (sectionPermissions || []).map(p => p.section_key as SectionKey)
    }

    const response: UserWithPermissions = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userRole,
      allowedSections,
      is_active: userData.is_active
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

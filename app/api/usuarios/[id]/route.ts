import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Obtener usuario específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        nombre: true,
        apellidos: true,
        telefono: true,
        rol: true,
        estado: true,
        organizacion: true
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Formatear respuesta
    const usuarioFormateado = {
      id: usuario.id,
      nombre: usuario.nombre || usuario.name?.split(' ')[0] || 'Sin nombre',
      apellidos: usuario.apellidos || usuario.name?.split(' ').slice(1).join(' ') || '',
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol: usuario.rol || (usuario.role === 'ADMIN' ? 'admin' : usuario.role === 'COORDINADOR' ? 'coordinador' : usuario.role === 'VOLUNTARIO' ? 'voluntario' : 'usuario'),
      estado: usuario.estado || 'activo',
      fechaRegistro: usuario.createdAt.toISOString().split('T')[0],
      ultimoAcceso: usuario.updatedAt.toISOString().split('T')[0],
      organizacion: usuario.organizacion || 'Sistema Central'
    }
    
    return NextResponse.json(usuarioFormateado)
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const { nombre, apellidos, email, telefono, rol, estado, organizacion } = body

    console.log('📝 Actualizando usuario:', { id, email, nombre, apellidos, rol })

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Mapear rol al enum de Prisma
    let prismaRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'COORDINADOR' | 'VOLUNTARIO' = existingUser.role as any
    if (rol === 'admin') prismaRole = 'ADMIN'
    else if (rol === 'coordinador') prismaRole = 'COORDINADOR'
    else if (rol === 'voluntario') prismaRole = 'VOLUNTARIO'
    else if (rol === 'usuario') prismaRole = 'USER'

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: `${nombre} ${apellidos}`.trim(),
        email,
        role: prismaRole,
        // Campos adicionales si el esquema los admite
        ...(nombre && { nombre }),
        ...(apellidos && { apellidos }),
        ...(telefono && { telefono }),
        ...(rol && { rol }),
        ...(estado && { estado }),
        ...(organizacion && { organizacion })
      }
    })

    console.log('✅ Usuario actualizado exitosamente:', updatedUser.id)
    
    // Formatear respuesta
    const usuarioFormateado = {
      id: updatedUser.id,
      nombre: nombre || updatedUser.name?.split(' ')[0] || 'Sin nombre',
      apellidos: apellidos || updatedUser.name?.split(' ').slice(1).join(' ') || '',
      email: updatedUser.email,
      telefono: telefono || '',
      rol: rol || 'usuario',
      estado: estado || 'activo',
      fechaRegistro: updatedUser.createdAt.toISOString().split('T')[0],
      ultimoAcceso: updatedUser.updatedAt.toISOString().split('T')[0],
      organizacion: organizacion || 'Sistema Central'
    }
    
    return NextResponse.json(usuarioFormateado)
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    console.log('🗑️ Eliminando usuario:', { id })

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id }
    })

    console.log('✅ Usuario eliminado exitosamente:', id)
    
    return NextResponse.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}

// PATCH - Resetear contraseña
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const { newPassword } = body

    console.log('🔐 Reseteando contraseña para usuario:', { id })

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword || '123456', 10)

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Contraseña reseteada exitosamente para usuario:', id)
    
    return NextResponse.json({ message: 'Contraseña reseteada exitosamente' })
  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error)
    return NextResponse.json(
      { error: 'Error al resetear contraseña' },
      { status: 500 }
    )
  }
}

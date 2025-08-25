import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    console.log('🔍 Obteniendo usuarios desde la base de datos...')
    
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Campos adicionales si existen
        nombre: true,
        apellidos: true,
        telefono: true,
        rol: true,
        estado: true,
        organizacion: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Encontrados ${usuarios.length} usuarios`)
    
    // Mapear los datos para el frontend
    const usuariosFormateados = usuarios.map(user => ({
      id: user.id,
      nombre: user.nombre || user.name?.split(' ')[0] || 'Sin nombre',
      apellidos: user.apellidos || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      telefono: user.telefono || '',
      rol: user.rol || (user.role === 'ADMIN' ? 'admin' : user.role === 'COORDINADOR' ? 'coordinador' : user.role === 'VOLUNTARIO' ? 'voluntario' : 'usuario'),
      estado: user.estado || 'activo',
      fechaRegistro: user.createdAt.toISOString().split('T')[0],
      ultimoAcceso: user.updatedAt.toISOString().split('T')[0],
      organizacion: user.organizacion || 'Sistema Central'
    }))
    
    return NextResponse.json(usuariosFormateados)
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, apellidos, email, telefono, rol, estado, organizacion, password } = body

    console.log('👤 Creando nuevo usuario:', { email, nombre, apellidos, rol })

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password || '123456', 10)

    // Mapear rol al enum de Prisma
    let prismaRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'COORDINADOR' | 'VOLUNTARIO' = 'USER'
    if (rol === 'admin') prismaRole = 'ADMIN'
    else if (rol === 'coordinador') prismaRole = 'COORDINADOR'
    else if (rol === 'voluntario') prismaRole = 'VOLUNTARIO'

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        name: `${nombre} ${apellidos}`.trim(),
        email,
        password: hashedPassword,
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

    console.log('✅ Usuario creado exitosamente:', newUser.id)
    
    // Formatear respuesta
    const usuarioFormateado = {
      id: newUser.id,
      nombre: nombre || newUser.name?.split(' ')[0] || 'Sin nombre',
      apellidos: apellidos || newUser.name?.split(' ').slice(1).join(' ') || '',
      email: newUser.email,
      telefono: telefono || '',
      rol: rol || 'usuario',
      estado: estado || 'activo',
      fechaRegistro: newUser.createdAt.toISOString().split('T')[0],
      ultimoAcceso: newUser.updatedAt.toISOString().split('T')[0],
      organizacion: organizacion || 'Sistema Central'
    }
    
    return NextResponse.json(usuarioFormateado, { status: 201 })
  } catch (error) {
    console.error('❌ Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}

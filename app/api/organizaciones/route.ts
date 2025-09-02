import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const organizacionSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Email inválido"
  }),
  sitioWeb: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "URL inválida"
  }),
})

// GET - Obtener organizaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Buscar organizaciones donde el usuario es miembro
    const organizaciones = await prisma.organizacion.findMany({
      where: {
        miembros: {
          some: {
            userId: decoded.userId
          }
        }
      },
      include: {
        miembros: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            formularios: true,
            plantillas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ organizaciones })
  } catch (error) {
    console.error('Error obteniendo organizaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva organización
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    let organizacionData: {
      nombre: string;
      descripcion?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
      sitioWeb?: string;
    }
    
    try {
      const validatedData = organizacionSchema.parse(body)
      
      // Preparar datos para crear organización, asegurando que nombre esté presente
      organizacionData = {
        nombre: validatedData.nombre,
        ...(validatedData.descripcion && validatedData.descripcion !== '' && { descripcion: validatedData.descripcion }),
        ...(validatedData.direccion && validatedData.direccion !== '' && { direccion: validatedData.direccion }),
        ...(validatedData.telefono && validatedData.telefono !== '' && { telefono: validatedData.telefono }),
        ...(validatedData.email && validatedData.email !== '' && { email: validatedData.email }),
        ...(validatedData.sitioWeb && validatedData.sitioWeb !== '' && { sitioWeb: validatedData.sitioWeb }),
      }
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationError },
        { status: 400 }
      )
    }

    // Crear organización
    const organizacion = await prisma.organizacion.create({
      data: {
        ...organizacionData,
        miembros: {
          create: {
            userId: decoded.userId,
            rol: 'ADMIN' // El creador es admin por defecto
          }
        }
      },
      include: {
        miembros: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            formularios: true,
            plantillas: true
          }
        }
      }
    })

    return NextResponse.json({ organizacion })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error creando organización:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

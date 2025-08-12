import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Datos de ejemplo para perfiles comunitarios
    const perfilesComunitarios = [
      {
        id: "1",
        nombre: "Perfil Comunidad San José Poaquil",
        descripcion: "Perfil comunitario detallado para la aldea Haciendo a Vieja",
        comunidadId: "1",
        fechaCreacion: "2025-01-17",
        datos: {
          poblacion: 150,
          familias: 400,
          infraestructura: "Básica",
          servicios: ["Agua", "Electricidad"],
          necesidades: ["Educación", "Salud"]
        },
        createdAt: "2025-01-17T19:02:18Z",
        updatedAt: "2025-01-17T19:02:18Z"
      },
      {
        id: "2",
        nombre: "Perfil Comunidad Villas del Quetzal",
        descripcion: "Perfil comunitario para las colonias atendidas",
        comunidadId: "2",
        fechaCreacion: "2025-03-03",
        datos: {
          poblacion: 380,
          familias: 6,
          infraestructura: "Intermedia",
          servicios: ["Agua", "Electricidad", "Internet"],
          necesidades: ["Transporte", "Seguridad"]
        },
        createdAt: "2025-03-03T14:40:41Z",
        updatedAt: "2025-03-03T14:40:41Z"
      }
    ]

    return NextResponse.json(perfilesComunitarios)
  } catch (error) {
    console.error('Error en GET /api/perfiles-comunitarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const data = await request.json()

    // TODO: Implementar creación en base de datos cuando se actualice el schema
    const nuevoPerfil = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(nuevoPerfil, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/perfiles-comunitarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

    // Datos de ejemplo para formularios de auditoría
    const formulariosAuditoria = [
      {
        id: "1",
        nombre: "Auditoría de Procesos Financieros",
        descripcion: "Formulario para auditar los procesos financieros de las organizaciones",
        organizacion: "Fundación Ruta de Alimentos",
        fechaCreacion: "2025-01-10",
        estado: "activo",
        responsable: "María González",
        campos: 25,
        respuestas: 15,
        createdAt: "2025-01-10T10:00:00Z",
        updatedAt: "2025-01-15T14:30:00Z"
      },
      {
        id: "2",
        nombre: "Evaluación de Impacto Comunitario",
        descripcion: "Formulario para evaluar el impacto de los programas en las comunidades",
        organizacion: "Programa Abrazando Leyendas",
        fechaCreacion: "2025-01-05",
        estado: "revision",
        responsable: "Carlos Méndez",
        campos: 30,
        respuestas: 8,
        createdAt: "2025-01-05T09:15:00Z",
        updatedAt: "2025-01-12T16:45:00Z"
      }
    ]

    return NextResponse.json(formulariosAuditoria)
  } catch (error) {
    console.error('Error en GET /api/formularios-auditoria:', error)
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
    const nuevoFormulario = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(nuevoFormulario, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/formularios-auditoria:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

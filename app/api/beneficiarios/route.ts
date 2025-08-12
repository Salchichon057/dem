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

    // Datos de ejemplo para beneficiarios
    const beneficiarios = [
      {
        id: "1",
        nombre: "María Elena",
        apellidos: "González López",
        edad: 75,
        genero: "femenino",
        telefono: "5551-2345",
        direccion: "3era Calle 12-45, Zona 1",
        comunidad: "San José Poaquil",
        fechaIngreso: "2024-03-15",
        tipoApoyo: ["Alimentación", "Compañía", "Cuidado médico"],
        estado: "activo",
        responsable: "Ana Rodríguez",
        observaciones: "Requiere atención especial para diabetes",
        createdAt: "2024-03-15T10:00:00Z",
        updatedAt: "2025-01-10T14:30:00Z"
      },
      {
        id: "2",
        nombre: "José Manuel",
        apellidos: "Pérez Morales",
        edad: 82,
        genero: "masculino",
        telefono: "5552-6789",
        direccion: "Avenida Central 15-20",
        comunidad: "Villas del Quetzal",
        fechaIngreso: "2024-01-20",
        tipoApoyo: ["Alimentación", "Transporte", "Actividades recreativas"],
        estado: "activo",
        responsable: "Carlos Méndez",
        observaciones: "Participa activamente en actividades grupales",
        createdAt: "2024-01-20T09:15:00Z",
        updatedAt: "2025-01-05T16:45:00Z"
      },
      {
        id: "3",
        nombre: "Carmen Rosa",
        apellidos: "Herrera Vásquez",
        edad: 68,
        genero: "femenino",
        telefono: "5553-9876",
        direccion: "2da Avenida 8-12, Zona 3",
        comunidad: "San José Poaquil",
        fechaIngreso: "2023-11-10",
        tipoApoyo: ["Alimentación", "Compañía"],
        estado: "graduado",
        responsable: "María González",
        observaciones: "Completó programa exitosamente",
        createdAt: "2023-11-10T11:30:00Z",
        updatedAt: "2024-12-15T10:20:00Z"
      }
    ]

    return NextResponse.json(beneficiarios)
  } catch (error) {
    console.error('Error en GET /api/beneficiarios:', error)
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
    const nuevoBeneficiario = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(nuevoBeneficiario, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/beneficiarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

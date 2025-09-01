import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const comunidades = await prisma.comunidadPimco.findMany({
      include: {
        _count: {
          select: {
            entrevistas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comunidades)
  } catch (error) {
    console.error('Error al obtener comunidades PIMCO:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const comunidad = await prisma.comunidadPimco.create({
      data: {
        nombreComunidad: data.nombreComunidad,
        departamento: data.departamento,
        municipio: data.municipio,
        corregimiento: data.corregimiento || '',
        vereda: data.vereda || '',
        numeroFamilias: parseInt(data.numeroFamilias),
        numeroPersonas: parseInt(data.numeroPersonas),
        coordinadorComunitario: data.coordinadorComunitario,
        telefonoCoordinador: data.telefonoCoordinador,
        estado: data.estado || 'ACTIVO',
        observaciones: data.observaciones || ''
      }
    })

    return NextResponse.json(comunidad, { status: 201 })
  } catch (error) {
    console.error('Error al crear comunidad PIMCO:', error)
    return NextResponse.json(
      { error: 'Error al crear la comunidad' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entrevistas = await prisma.entrevistaPimco.findMany({
      include: {
        comunidad: {
          select: {
            nombreComunidad: true,
            departamento: true,
            municipio: true
          }
        }
      },
      orderBy: {
        fechaEncuesta: 'desc'
      }
    })

    return NextResponse.json(entrevistas)
  } catch (error) {
    console.error('Error al obtener entrevistas PIMCO:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const entrevista = await prisma.entrevistaPimco.create({
      data: {
        fechaEncuesta: new Date(data.fechaEncuesta),
        estadoVisita: data.estadoVisita,
        nombreEncargado: data.nombreEncargado,
        sexoEntrevistado: data.sexoEntrevistado,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        ocupacionJefeHogar: data.ocupacionJefeHogar || '',
        comunidadId: data.comunidadId,
        encuestadorId: data.encuestadorId || null,
        observaciones: data.observaciones || ''
      },
      include: {
        comunidad: {
          select: {
            nombreComunidad: true,
            departamento: true,
            municipio: true
          }
        }
      }
    })

    return NextResponse.json(entrevista, { status: 201 })
  } catch (error) {
    console.error('Error al crear entrevista PIMCO:', error)
    return NextResponse.json(
      { error: 'Error al crear la entrevista' },
      { status: 500 }
    )
  }
}

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
        nombreComunidad: data.aldeas || `${data.municipio} - ${data.aldeas}`,
        departamento: data.departamento,
        municipio: data.municipio,
        aldeas: data.aldeas || '',
        caseriosQueAtienden: data.caseriosQueAtienden || '',
        qtyCaseriosQueAtienden: parseInt(data.qtyCaseriosQueAtienden) || 0,
        ubicacionGoogleMaps: data.ubicacionGoogleMaps || '',
        liderNumero: data.liderNumero || '',
        comiteComunitario: data.comiteComunitario || '',
        activa: data.activa !== undefined ? data.activa : true,
        estado: data.estado || 'ACTIVA',
        cantidadFamiliasEnComunidad: parseInt(data.cantidadFamiliasEnComunidad) || 0,
        cantidadFamEnRA: parseInt(data.cantidadFamEnRA) || 0,
        fotografiaReferencia: data.fotografiaReferencia || '',
        motivoSuspencionOBaja: data.motivoSuspencionOBaja || ''
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

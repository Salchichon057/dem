import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { id } = await params

    const comunidad = await prisma.comunidadPimco.update({
      where: { id },
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

    return NextResponse.json(comunidad)
  } catch (error) {
    console.error('Error al actualizar comunidad PIMCO:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la comunidad' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.comunidadPimco.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Comunidad eliminada exitosamente' })
  } catch (error) {
    console.error('Error al eliminar comunidad PIMCO:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la comunidad' },
      { status: 500 }
    )
  }
}
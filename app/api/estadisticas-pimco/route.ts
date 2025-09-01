import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener estadísticas generales
    const totalComunidades = await prisma.comunidadPimco.count()
    const totalEntrevistas = await prisma.entrevistaPimco.count()
    
    // Comunidades por departamento
    const comunidadesPorDepartamento = await prisma.comunidadPimco.groupBy({
      by: ['departamento'],
      _count: {
        id: true
      }
    })

    // Entrevistas por estado de visita
    const entrevistasPorEstado = await prisma.entrevistaPimco.groupBy({
      by: ['estadoVisita'],
      _count: {
        id: true
      }
    })

    // Distribución por sexo
    const distribucionSexo = await prisma.entrevistaPimco.groupBy({
      by: ['sexoEntrevistado'],
      _count: {
        id: true
      }
    })

    // Ocupaciones más comunes
    const ocupaciones = await prisma.entrevistaPimco.groupBy({
      by: ['ocupacionJefeHogar'],
      _count: {
        id: true
      },
      where: {
        ocupacionJefeHogar: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Entrevistas por mes
    const entrevistasPorMes = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "fechaEncuesta") as anio,
        EXTRACT(MONTH FROM "fechaEncuesta") as mes,
        COUNT(*) as total
      FROM "entrevistas_pimco"
      GROUP BY EXTRACT(YEAR FROM "fechaEncuesta"), EXTRACT(MONTH FROM "fechaEncuesta")
      ORDER BY anio DESC, mes DESC
      LIMIT 12
    `

    // Comunidades con más entrevistas
    const comunidadesActividad = await prisma.comunidadPimco.findMany({
      select: {
        id: true,
        nombreComunidad: true,
        coordinadorComunitario: true,
        _count: {
          select: {
            entrevistas: true
          }
        }
      },
      orderBy: {
        entrevistas: {
          _count: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      resumenGeneral: {
        totalEntrevistas,
        totalComunidades,
        encuestadoresActivos: 3, // Este número podríamos calcularlo dinámicamente
        periodoInicio: '2024-04-25', // Podríamos calcularlo dinámicamente
        periodoFin: new Date().toISOString().split('T')[0]
      },
      comunidadesPorDepartamento,
      entrevistasPorEstado,
      distribucionSexo,
      ocupaciones,
      entrevistasPorMes,
      comunidadesActividad
    })
  } catch (error) {
    console.error('Error al obtener estadísticas PIMCO:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

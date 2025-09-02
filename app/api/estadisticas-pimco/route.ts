import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tipo para el resultado de la query raw de entrevistas por mes
interface EntrevistaPorMes {
  anio: bigint
  mes: bigint
  total: bigint
}

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
    const entrevistasPorMes = await prisma.$queryRaw<EntrevistaPorMes[]>`
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
        totalEntrevistas: Number(totalEntrevistas),
        totalComunidades: Number(totalComunidades),
        encuestadoresActivos: 3, // Este número podríamos calcularlo dinámicamente
        periodoInicio: '2024-04-25', // Podríamos calcularlo dinámicamente
        periodoFin: new Date().toISOString().split('T')[0]
      },
      comunidadesPorDepartamento: comunidadesPorDepartamento.map(item => ({
        ...item,
        _count: {
          ...item._count,
          id: Number(item._count.id)
        }
      })),
      entrevistasPorEstado: entrevistasPorEstado.map(item => ({
        ...item,
        _count: {
          ...item._count,
          id: Number(item._count.id)
        }
      })),
      distribucionSexo: distribucionSexo.map(item => ({
        ...item,
        _count: {
          ...item._count,
          id: Number(item._count.id)
        }
      })),
      ocupaciones: ocupaciones.map(item => ({
        ...item,
        _count: {
          ...item._count,
          id: Number(item._count.id)
        }
      })),
      entrevistasPorMes: entrevistasPorMes.map((item: EntrevistaPorMes) => ({
        ...item,
        anio: Number(item.anio),
        mes: Number(item.mes),
        total: Number(item.total)
      })),
      comunidadesActividad: comunidadesActividad.map(item => ({
        ...item,
        _count: {
          ...item._count,
          entrevistas: Number(item._count.entrevistas)
        }
      }))
    })
  } catch (error) {
    console.error('Error al obtener estadísticas PIMCO:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

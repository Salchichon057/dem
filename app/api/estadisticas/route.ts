import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    // Obtener organizaciones del usuario
    const userOrganizaciones = await prisma.organizacionMember.findMany({
      where: { userId: decoded.userId },
      select: { organizacionId: true }
    })

    const organizacionIds = userOrganizaciones.map(org => org.organizacionId)

    // Estadísticas generales
    const [
      totalOrganizaciones,
      totalFormularios,
      totalPlantillas,
      formulariosPorEstado,
      respuestasRecientes,
      organizacionesPorEstado
    ] = await Promise.all([
      // Total de organizaciones del usuario
      prisma.organizacion.count({
        where: {
          id: { in: organizacionIds }
        }
      }),
      
      // Total de formularios
      prisma.formulario.count({
        where: {
          OR: [
            { creadorId: decoded.userId },
            { organizacionId: { in: organizacionIds } }
          ]
        }
      }),
      
      // Total de plantillas
      prisma.plantilla.count({
        where: {
          OR: [
            { creadorId: decoded.userId },
            { organizacionId: { in: organizacionIds } }
          ]
        }
      }),
      
      // Formularios por estado
      prisma.formulario.groupBy({
        by: ['estado'],
        where: {
          OR: [
            { creadorId: decoded.userId },
            { organizacionId: { in: organizacionIds } }
          ]
        },
        _count: {
          id: true
        }
      }),
      
      // Respuestas recientes (últimos 30 días)
      prisma.respuestaFormulario.count({
        where: {
          formulario: {
            OR: [
              { creadorId: decoded.userId },
              { organizacionId: { in: organizacionIds } }
            ]
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 días atrás
          }
        }
      }),
      
      // Organizaciones por estado
      prisma.organizacion.groupBy({
        by: ['estado'],
        where: {
          id: { in: organizacionIds }
        },
        _count: {
          id: true
        }
      })
    ])

    // Calcular tendencias (comparar con mes anterior)
    const fechaInicioMesAnterior = new Date()
    fechaInicioMesAnterior.setMonth(fechaInicioMesAnterior.getMonth() - 2)
    fechaInicioMesAnterior.setDate(1)
    
    const fechaFinMesAnterior = new Date()
    fechaFinMesAnterior.setMonth(fechaFinMesAnterior.getMonth() - 1)
    fechaFinMesAnterior.setDate(0)

    const respuestasMesAnterior = await prisma.respuestaFormulario.count({
      where: {
        formulario: {
          OR: [
            { creadorId: decoded.userId },
            { organizacionId: { in: organizacionIds } }
          ]
        },
        createdAt: {
          gte: fechaInicioMesAnterior,
          lte: fechaFinMesAnterior
        }
      }
    })

    // Estadísticas semanales para gráfico
    const semanas = []
    for (let i = 6; i >= 0; i--) {
      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - (i * 7))
      inicioSemana.setHours(0, 0, 0, 0)
      
      const finSemana = new Date(inicioSemana)
      finSemana.setDate(finSemana.getDate() + 6)
      finSemana.setHours(23, 59, 59, 999)

      const respuestasSemana = await prisma.respuestaFormulario.count({
        where: {
          formulario: {
            OR: [
              { creadorId: decoded.userId },
              { organizacionId: { in: organizacionIds } }
            ]
          },
          createdAt: {
            gte: inicioSemana,
            lte: finSemana
          }
        }
      })

      semanas.push({
        semana: `Semana ${7 - i}`,
        respuestas: respuestasSemana
      })
    }

    const tendenciaRespuestas = respuestasRecientes - respuestasMesAnterior
    const porcentajeTendencia = respuestasMesAnterior > 0 
      ? ((tendenciaRespuestas / respuestasMesAnterior) * 100) 
      : respuestasRecientes > 0 ? 100 : 0

    const estadisticas = {
      resumen: {
        organizaciones: totalOrganizaciones,
        formularios: totalFormularios,
        plantillas: totalPlantillas,
        respuestasRecientes,
        tendenciaRespuestas: {
          valor: tendenciaRespuestas,
          porcentaje: Math.round(porcentajeTendencia * 100) / 100
        }
      },
      formulariosPorEstado: formulariosPorEstado.map(item => ({
        estado: item.estado,
        cantidad: item._count.id
      })),
      organizacionesPorEstado: organizacionesPorEstado.map(item => ({
        estado: item.estado,
        cantidad: item._count.id
      })),
      respuestasPorSemana: semanas
    }

    return NextResponse.json({ estadisticas })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

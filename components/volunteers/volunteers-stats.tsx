'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, Grid, Metric, Text, Title as TremorTitle } from '@tremor/react'
import { Users, UserCheck, Clock, Award, TrendingUp, AlertCircle } from 'lucide-react'

interface VolunteerStats {
  total: number
  active: number
  inactive: number
  totalHours: number
  averageHoursPerVolunteer: number
  completedProjects: number
  by_area: Record<string, number>
  by_month: Record<string, {
    volunteers: number
    hours: number
    projects: number
  }>
  top_volunteers: Array<{
    name: string
    hours: number
    projects: number
    area: string
  }>
}

export default function VolunteersStats() {
  const [stats, setStats] = useState<VolunteerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Por ahora usamos datos de ejemplo
      // TODO: Reemplazar con llamada real a /api/volunteers/stats
      setStats({
        total: 156,
        active: 123,
        inactive: 33,
        totalHours: 2840,
        averageHoursPerVolunteer: 23,
        completedProjects: 45,
        by_area: {
          'Educación': 45,
          'Salud': 38,
          'Medio Ambiente': 32,
          'Tecnología': 25,
          'Deportes': 16
        },
        by_month: {
          'Enero': { volunteers: 98, hours: 420, projects: 6 },
          'Febrero': { volunteers: 105, hours: 485, projects: 8 },
          'Marzo': { volunteers: 112, hours: 520, projects: 9 },
          'Abril': { volunteers: 118, hours: 550, projects: 8 },
          'Mayo': { volunteers: 123, hours: 580, projects: 10 },
          'Junio': { volunteers: 129, hours: 615, projects: 12 }
        },
        top_volunteers: [
          { name: 'María González', hours: 85, projects: 6, area: 'Educación' },
          { name: 'Carlos Méndez', hours: 78, projects: 5, area: 'Salud' },
          { name: 'Ana Rodríguez', hours: 72, projects: 4, area: 'Medio Ambiente' },
          { name: 'Luis Pérez', hours: 68, projects: 5, area: 'Tecnología' },
          { name: 'Carmen López', hours: 65, projects: 4, area: 'Deportes' }
        ]
      })
    } catch {
      toast.error('Error al cargar estadísticas de voluntarios')
    } finally {
      setLoading(false)
    }
  }

  const calculateActivityRate = () => {
    if (!stats || stats.total === 0) return 0
    return Math.round((stats.active / stats.total) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <Grid numItemsLg={4} className="gap-6">
        <Card>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <TremorTitle>Total Voluntarios</TremorTitle>
          </div>
          <Metric>{stats.total}</Metric>
          <Text>Registrados en el sistema</Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <TremorTitle>Activos</TremorTitle>
          </div>
          <Metric>{stats.active}</Metric>
          <Text>{calculateActivityRate()}% del total</Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <TremorTitle>Horas Totales</TremorTitle>
          </div>
          <Metric>{stats.totalHours.toLocaleString()}</Metric>
          <Text>{stats.averageHoursPerVolunteer} hrs promedio/voluntario</Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-500" />
            <TremorTitle>Proyectos</TremorTitle>
          </div>
          <Metric>{stats.completedProjects}</Metric>
          <Text>Proyectos completados</Text>
        </Card>
      </Grid>

      {/* Distribución por Área */}
      <Card>
        <TremorTitle>Distribución por Área</TremorTitle>
        <Text>Voluntarios por área de trabajo</Text>
        <div className="mt-6 space-y-3">
          {Object.entries(stats.by_area)
            .sort(([, a], [, b]) => b - a)
            .map(([area, count]) => (
              <div key={area} className="flex items-center justify-between">
                <span className="text-sm font-medium">{area}</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Rendimiento Mensual */}
      <Card>
        <TremorTitle>Tendencia Mensual</TremorTitle>
        <Text>Evolución de voluntarios, horas y proyectos</Text>
        <div className="mt-6">
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(stats.by_month).map(([month, data]) => (
              <div key={month} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{month}</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-semibold">{data.volunteers}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-gray-600">{data.hours}h</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Award className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-600">{data.projects}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Top Voluntarios */}
      <Card>
        <TremorTitle>Top 5 Voluntarios</TremorTitle>
        <Text>Voluntarios destacados por horas de servicio</Text>
        <div className="mt-6 space-y-4">
          {stats.top_volunteers.map((volunteer, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{volunteer.name}</div>
                  <div className="text-xs text-gray-500">{volunteer.area}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-purple-600 font-semibold">
                  <Clock className="h-4 w-4" />
                  {volunteer.hours} hrs
                </div>
                <div className="text-xs text-gray-500">{volunteer.projects} proyectos</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Indicadores Clave */}
      <Grid numItemsLg={3} className="gap-6">
        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <TremorTitle>Tasa de Actividad</TremorTitle>
          </div>
          <Metric>{calculateActivityRate()}%</Metric>
          <Text>Voluntarios activos vs total</Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <TremorTitle>Promedio de Horas</TremorTitle>
          </div>
          <Metric>{stats.averageHoursPerVolunteer}</Metric>
          <Text>Horas por voluntario activo</Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-500" />
            <TremorTitle>Proyectos por Voluntario</TremorTitle>
          </div>
          <Metric>{(stats.completedProjects / stats.active).toFixed(1)}</Metric>
          <Text>Promedio de participación</Text>
        </Card>
      </Grid>
    </div>
  )
}


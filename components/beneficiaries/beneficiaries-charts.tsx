'use client'

import { useState, useEffect } from 'react'
import { BeneficiaryStats } from '@/lib/types'
import { toast } from 'sonner'
import {
  Card,
  DonutChart,
  Grid,
  Metric,
  Text,
  Flex,
  Title,
  BarChart,
} from '@tremor/react'
import GuatemalaMap from './guatemala-map'

export default function BeneficiariesCharts() {
  const [stats, setStats] = useState<BeneficiaryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/beneficiaries/stats')
      const data = await response.json()

      if (response.ok) {
        console.log('Stats data received:', data) // Debug
        setStats(data.stats) // Acceder a data.stats en lugar de data directamente
      } else {
        toast.error('Error al cargar estadísticas')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
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
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    )
  }

  // Calculate percentages
  const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
  const inactivePercentage = stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0

  // Prepare data for Tremor charts
  const genderData = [
    {
      name: 'Femenino',
      value: stats.by_gender?.femenino || 0,
    },
    {
      name: 'Masculino',
      value: stats.by_gender?.masculino || 0,
    },
  ]

  const departmentData = Object.entries(stats.by_department || {})
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)

  const programData = Object.entries(stats.by_program || {})
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gráficos y Estadísticas</h2>
        <p className="text-muted-foreground">Resumen visual de beneficiarios</p>
      </div>

      {/* Summary Cards with Tremor */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Total Beneficiarios</Text>
              <Metric>{stats.total}</Metric>
            </div>
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Activos</Text>
              <Metric className="text-green-600">{stats.active}</Metric>
              <Text className="text-xs text-gray-500">{activePercentage}% del total</Text>
            </div>
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Inactivos</Text>
              <Metric className="text-gray-600">{stats.inactive}</Metric>
              <Text className="text-xs text-gray-500">{inactivePercentage}% del total</Text>
            </div>
          </Flex>
        </Card>

        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Edad Promedio</Text>
              <Metric>{stats.average_age}</Metric>
              <Text className="text-xs text-gray-500">años</Text>
            </div>
          </Flex>
        </Card>
      </Grid>

      {/* Maps and Charts Grid */}
      <Grid numItemsLg={2} className="gap-6">
        {/* Guatemala Map */}
        <Card>
          <Title>Beneficiarios por Departamento</Title>
          <Text>Mapa interactivo de Guatemala</Text>
          <GuatemalaMap data={stats.by_department || {}} />
        </Card>

        {/* Gender Distribution Donut Chart */}
        <Card>
          <Title>Distribución por Género</Title>
          <Text>Proporción de beneficiarios por género</Text>
          <DonutChart
            data={genderData}
            category="value"
            index="name"
            colors={["pink", "blue"]}
            className="mt-6"
            showLabel={true}
            valueFormatter={(value) => `${value} personas`}
          />
        </Card>
      </Grid>

      {/* Bar Charts Grid */}
      <Grid numItemsLg={2} className="gap-6">
        {/* Programs Bar Chart */}
        <Card>
          <Title>Población por Programas</Title>
          <Text>Distribución de beneficiarios por tipo de programa</Text>
          <BarChart
            data={programData}
            index="name"
            categories={["value"]}
            colors={["emerald"]}
            valueFormatter={(value: number) => `${value} beneficiarios`}
            yAxisWidth={100}
            className="mt-6 h-80"
            showLegend={false}
            showAnimation={true}
          />
        </Card>

        {/* Departments Bar Chart */}
        <Card>
          <Title>Ranking por Departamento</Title>
          <Text>Departamentos con más beneficiarios</Text>
          <BarChart
            data={departmentData.slice(0, 10)}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            valueFormatter={(value: number) => `${value} beneficiarios`}
            yAxisWidth={120}
            className="mt-6 h-80"
            showLegend={false}
            layout="vertical"
            showAnimation={true}
          />
        </Card>
      </Grid>
    </div>
  )
}

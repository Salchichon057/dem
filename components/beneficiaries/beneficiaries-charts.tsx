'use client'

import { useState, useEffect } from 'react'
import { BeneficiaryStats } from '@/lib/types'
import { toast } from 'sonner'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Grid, Metric, Text, Flex, Title as TremorTitle } from '@tremor/react'
import GuatemalaMap from './guatemala-map'
import BeneficiariesSummaryTable from './beneficiaries-summary-table'

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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
        setStats(data.stats)
      } else {
        toast.error('Error al cargar estadísticas')
      }
    } catch {
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

  // Datos para gráfico de género (Doughnut)
  const genderChartData = {
    labels: ['Masculino', 'Femenino'],
    datasets: [
      {
        label: 'Beneficiarios',
        data: [stats.by_gender?.masculino || 0, stats.by_gender?.femenino || 0],
        backgroundColor: ['#3b82f6', '#ec4899'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
        hoverBackgroundColor: ['#2563eb', '#db2777'],
        hoverBorderColor: ['#ffffff', '#ffffff'],
        hoverBorderWidth: 3,
      },
    ],
  }

  const genderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 14 },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  // Datos para gráfico de programas
  const programData = Object.entries(stats.by_program || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const programChartData = {
    labels: programData.map((item) => item.name),
    datasets: [
      {
        label: 'Beneficiarios',
        data: programData.map((item) => item.value),
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#059669',
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  }

  const programChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return `${context.parsed.x} beneficiarios`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { font: { size: 12 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  }

  // Datos para gráfico de bolsas
  const bagData = Object.entries(stats.by_bag || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const bagChartData = {
    labels: bagData.map((item) => item.name),
    datasets: [
      {
        label: 'Beneficiarios',
        data: bagData.map((item) => item.value),
        backgroundColor: '#f59e0b',
        hoverBackgroundColor: '#d97706',
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  }

  const bagChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return `${context.parsed.x} beneficiarios`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { font: { size: 12 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  }

  // Datos para gráfico de departamentos (top 10)
  const departmentData = Object.entries(stats.by_department || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const departmentChartData = {
    labels: departmentData.map((item) => item.name),
    datasets: [
      {
        label: 'Beneficiarios',
        data: departmentData.map((item) => item.value),
        backgroundColor: '#6366f1',
        hoverBackgroundColor: '#4f46e5',
        borderRadius: 6,
      },
    ],
  }

  const departmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return `${context.parsed.y} beneficiarios`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { font: { size: 12 } },
      },
    },
  }

  return (
    
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Gráficos y Estadísticas</h2>
          <p className="text-muted-foreground">Resumen visual de beneficiarios</p>
        </div>

        {/* Summary Cards */}
        <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <div className="border border-black rounded-md p-6">
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Total Beneficiarios</Text>
              <Metric>{stats.total}</Metric>
            </div>
          </Flex>
        </div>

        <div className="border border-black rounded-md p-6">
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Activos</Text>
              <Metric className="text-green-600">{stats.active}</Metric>
              <Text className="text-xs text-gray-500">{activePercentage}% del total</Text>
            </div>
          </Flex>
        </div>

        <div className="border border-black rounded-md p-6">
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Inactivos</Text>
              <Metric className="text-gray-600">{stats.inactive}</Metric>
              <Text className="text-xs text-gray-500">{inactivePercentage}% del total</Text>
            </div>
          </Flex>
        </div>

        <div className="border border-black rounded-md p-6">
          <Flex alignItems="start">
            <div className="truncate">
              <Text>Edad Promedio</Text>
              <Metric>{stats.average_age}</Metric>
              <Text className="text-xs text-gray-500">años</Text>
            </div>
          </Flex>
        </div>
      </Grid>

      {/* Maps and Charts Grid */}
      <Grid numItemsLg={2} className="gap-6">
        {/* Guatemala Map */}
        <div className="border border-black rounded-md p-6">
          <TremorTitle>Beneficiarios por Departamento</TremorTitle>
          <Text>Mapa interactivo de Guatemala</Text>
          <GuatemalaMap data={stats.by_department || {}} />
        </div>

        {/* Gender Distribution Chart */}
        <div className="border border-black rounded-md p-6">
          <TremorTitle>Distribución por Género</TremorTitle>
          <Text>Proporción de beneficiarios por género</Text>
          <div className="mt-6" style={{ height: '350px' }}>
            <Doughnut data={genderChartData} options={genderChartOptions} />
          </div>
        </div>
      </Grid>

      {/* Bar Charts Grid */}
      <Grid numItemsLg={2} className="gap-6">
        {/* Programs Bar Chart */}
        <div className="border border-black rounded-md p-6">
          <TremorTitle>Población por Programas</TremorTitle>
          <Text>Distribución de beneficiarios por tipo de programa</Text>
          <div className="mt-6" style={{ height: '400px' }}>
            <Bar data={programChartData} options={programChartOptions} />
          </div>
        </div>

        {/* Departments Bar Chart */}
        <div className="border border-black rounded-md p-6">
          <TremorTitle>Ranking por Departamento</TremorTitle>
          <Text>Departamentos con más beneficiarios</Text>
          <div className="mt-6" style={{ height: '400px' }}>
            <Bar data={departmentChartData} options={departmentChartOptions} />
          </div>
        </div>
      </Grid>

      {/* Bags Chart */}
      {stats.by_bag && Object.keys(stats.by_bag).length > 0 && bagData.length > 0 && (
        <div className="border border-black rounded-md p-6">
          <TremorTitle>Distribución por Bolsa</TremorTitle>
          <Text>Beneficiarios agrupados por tipo de bolsa</Text>
          <div className="mt-6" style={{ height: '400px' }}>
            <Bar data={bagChartData} options={bagChartOptions} />
          </div>
        </div>
      )}

        {/* Summary Table */}
        <BeneficiariesSummaryTable stats={stats} />
      </div>
  )
}


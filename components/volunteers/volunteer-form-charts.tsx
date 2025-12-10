'use client'

import { useState, useEffect } from 'react'
import { VolunteerFormStats } from '@/lib/types'
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
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Grid, Metric, Text, Title as TremorTitle } from '@tremor/react'

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const FORM_ID = 'f036d9ff-e51a-46ca-8744-6f8187966f5b'

export default function VolunteerFormCharts() {
  const [stats, setStats] = useState<VolunteerFormStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/statistics/form/${FORM_ID}`)
      const data = await response.json()

      if (response.ok) {
        setStats(data)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  const typeData = Object.entries(stats.by_type || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const shiftData = Object.entries(stats.by_shift || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const typeChartData = {
    labels: typeData.map((item) => item.name),
    datasets: [
      {
        data: typeData.map((item) => item.value),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  const shiftChartData = {
    labels: shiftData.map((item) => item.name),
    datasets: [
      {
        label: 'Voluntarios',
        data: shiftData.map((item) => item.value),
        backgroundColor: '#8b5cf6',
        hoverBackgroundColor: '#7c3aed',
        borderRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 12 } },
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
      y: {
        grid: { display: true },
        ticks: { font: { size: 12 } },
      },
    },
  }

  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
        <div className="border border-black rounded-md p-6">
          <div className="flex items-center gap-3">
            <div>
              <Text>Total Voluntarios</Text>
              <Metric>{stats.total_volunteers}</Metric>
            </div>
          </div>
        </div>

        <div className="border border-black rounded-md p-6">
          <div className="flex items-center gap-3">
            <div>
              <Text>Promedio de Horas</Text>
              <Metric>{stats.average_hours.toFixed(2)}</Metric>
            </div>
          </div>
        </div>

        <div className="border border-black rounded-md p-6">
          <div className="flex items-center gap-3">
            <div>
              <Text>Con Beneficio</Text>
              <Metric>{stats.volunteers_with_benefit}</Metric>
            </div>
          </div>
        </div>

        <div className="border border-black rounded-md p-6">
          <div className="flex items-center gap-3">
            <div>
              <Text>Total en Q</Text>
              <Metric>Q {stats.total_amount_q.toFixed(2)}</Metric>
            </div>
          </div>
        </div>
      </Grid>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
        <div className="border border-black rounded-md p-6">
          <div className="flex items-center gap-3">
            <div>
              <Text>Libras Agrícolas</Text>
              <Metric>{stats.total_agricultural_pounds.toFixed(2)}</Metric>
            </div>
          </div>
        </div>

        <div className="border border-black rounded-md p-6">
          <div className="flex items-center gap-3">
            <div>
              <Text>Bolsas de Víveres</Text>
              <Metric>{stats.total_viveres_bags.toFixed(2)}</Metric>
            </div>
          </div>
        </div>
      </Grid>

      <Grid numItems={1} numItemsSm={1} numItemsLg={2} className="gap-6">
        <div className="border border-black rounded-md p-6">
          <TremorTitle>Voluntarios por Tipo</TremorTitle>
          <div className="h-80 mt-4">
            {typeData.length > 0 ? (
              <Doughnut data={typeChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Sin datos</p>
              </div>
            )}
          </div>
        </div>

        <div className="border border-black rounded-md p-6">
          <TremorTitle>Voluntarios por Turno</TremorTitle>
          <div className="h-80 mt-4">
            {shiftData.length > 0 ? (
              <Bar data={shiftChartData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Sin datos</p>
              </div>
            )}
          </div>
        </div>
      </Grid>
    </div>
  )
}

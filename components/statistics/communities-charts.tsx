'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Baby } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#ef4444']

interface CommunityStats {
  totalCommunities: number
  activeCommunities: number
  inactiveCommunities: number
  suspendedCommunities: number
  totalBeneficiaries: number
  byAgeGender: Array<{ age: string; mujeres: number; hombres: number }>
  totalFamilies: number
  familiesInRa: number
  pregnant: number
  lactating: number
}

export default function CommunitiesCharts() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/statistics/communities')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const statusData = [
    { name: 'Activas', value: stats.activeCommunities },
    { name: 'Inactivas', value: stats.inactiveCommunities },
    { name: 'Suspendidas', value: stats.suspendedCommunities }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comunidades</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommunities}</div>
            <p className="text-xs text-muted-foreground">{stats.activeCommunities} activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beneficiarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalBeneficiaries || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Personas atendidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Familias Atendidas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalFamilies || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{(stats.familiesInRa || 0).toLocaleString()} en RA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestantes/Lactantes</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pregnant + stats.lactating}</div>
            <p className="text-xs text-muted-foreground">{stats.pregnant} gestantes, {stats.lactating} lactantes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Comunidades</CardTitle>
          <CardDescription>Distribución de comunidades según su estado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beneficiarios por Rango de Edad y Sexo</CardTitle>
          <CardDescription>Distribución de beneficiarios por grupos etarios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.byAgeGender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mujeres" fill="#ec4899" name="Mujeres" />
              <Bar dataKey="hombres" fill="#3b82f6" name="Hombres" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

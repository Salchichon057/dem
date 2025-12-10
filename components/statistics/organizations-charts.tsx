/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Baby } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface OrganizationStats {
  totalOrganizations: number
  withLegal: number
  withoutLegal: number
  totalBeneficiaries: number
  byAgeGender: Array<{ age: string; mujeres: number; hombres: number }>
  totalFamilies: number
  pregnant: number
  lactating: number
}

interface OrganizationsChartsProps {
  formId: string
}

export default function OrganizationsCharts({ formId }: OrganizationsChartsProps) {
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (formId) {
      fetchStats()
    }
  }, [formId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/statistics/form/${formId}`)
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

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">Organizaciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beneficiarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBeneficiaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Personas atendidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Familias Atendidas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFamilies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de familias</p>
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

      {/* Gráfico de Barras Agrupadas - Beneficiarios por Edad y Sexo */}
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

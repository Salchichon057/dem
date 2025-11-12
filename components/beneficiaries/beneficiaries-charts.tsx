'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BeneficiaryStats } from '@/lib/types'
import { Users, UserCheck, UserX, Calendar } from 'lucide-react'
import { toast } from 'sonner'

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
        setStats(data)
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
  const masculinoPercentage = stats.total > 0 
    ? Math.round((stats.by_gender.masculino / stats.total) * 100) 
    : 0
  const femeninoPercentage = stats.total > 0 
    ? Math.round((stats.by_gender.femenino / stats.total) * 100) 
    : 0

  // Get top departments (top 5)
  const topDepartments = Object.entries(stats.by_department)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Get all programs
  const programs = Object.entries(stats.by_program)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gráficos y Estadísticas</h2>
        <p className="text-muted-foreground">Resumen visual de beneficiarios</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beneficiarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{activePercentage}% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">{inactivePercentage}% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edad Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_age}</div>
            <p className="text-xs text-muted-foreground">años</p>
          </CardContent>
        </Card>
      </div>

      {/* Gender Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
          <CardDescription>Total de beneficiarios por género</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Masculino */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Masculino</span>
                <span className="text-sm text-muted-foreground">
                  {stats.by_gender.masculino} ({masculinoPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${masculinoPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Femenino */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Femenino</span>
                <span className="text-sm text-muted-foreground">
                  {stats.by_gender.femenino} ({femeninoPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-pink-600 h-2.5 rounded-full"
                  style={{ width: `${femeninoPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Departments */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Departamentos</CardTitle>
          <CardDescription>Departamentos con más beneficiarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDepartments.length > 0 ? (
              topDepartments.map(([department, count]) => {
                const percentage = Math.round((count / stats.total) * 100)
                return (
                  <div key={department}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{department}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Programs Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Programa</CardTitle>
          <CardDescription>Total de beneficiarios por tipo de programa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {programs.length > 0 ? (
              programs.map(([program, count]) => {
                const percentage = Math.round((count / stats.total) * 100)
                return (
                  <div key={program}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{program}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

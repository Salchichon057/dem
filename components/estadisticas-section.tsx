"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Building2, Users, TrendingUp, MapPin, Clock } from "lucide-react"
import { obtenerEstadisticas, obtenerOrganizaciones, type Estadistica, type Organizacion, manejarErrorApi } from "@/lib/api"
import { toast } from "sonner"

export function EstadisticasSection() {
  const [estadisticas, setEstadisticas] = useState<Estadistica | null>(null)
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [statsData, orgsData] = await Promise.all([
        obtenerEstadisticas().catch(() => null),
        obtenerOrganizaciones()
      ])
      
      if (statsData) {
        setEstadisticas(statsData)
      } else {
        // Calcular estadísticas localmente si no hay API
        const stats: Estadistica = {
          totalOrganizaciones: orgsData.length,
          organizacionesActivas: orgsData.filter(org => org.estado === 'ACTIVA').length,
          organizacionesPendientes: orgsData.filter(org => org.estado === 'SUSPENDIDA').length,
          totalUsuarios: orgsData.reduce((acc, org) => acc + (org.miembros?.length || 0), 0),
          crecimientoMensual: 12.5
        }
        setEstadisticas(stats)
      }
      
      setOrganizaciones(orgsData)
    } catch (error) {
      toast.error(`Error cargando datos: ${manejarErrorApi(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const calcularPorcentaje = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) : "0.0"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (!estadisticas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    )
  }

  // Calcular distribución por departamentos
  const distribucionDepartamento = organizaciones.reduce((acc, org) => {
    const depto = org.departamento || 'No especificado'
    acc[depto] = (acc[depto] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDepartamentos = Object.entries(distribucionDepartamento)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{estadisticas.totalOrganizaciones}</div>
            <p className="text-xs text-blue-600 mt-1">
              +{estadisticas.crecimientoMensual}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Organizaciones Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{estadisticas.organizacionesActivas}</div>
            <p className="text-xs text-green-600 mt-1">
              {calcularPorcentaje(estadisticas.organizacionesActivas, estadisticas.totalOrganizaciones)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Org. Suspendidas</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{estadisticas.organizacionesPendientes}</div>
            <p className="text-xs text-orange-600 mt-1">
              {calcularPorcentaje(estadisticas.organizacionesPendientes, estadisticas.totalOrganizaciones)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Beneficiarios</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {organizaciones.reduce((acc, org) => acc + (org.poblacionTotalDEM || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Promedio: {Math.round(organizaciones.reduce((acc, org) => acc + (org.poblacionTotalDEM || 0), 0) / Math.max(estadisticas.totalOrganizaciones, 1)).toLocaleString()} por org.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de distribución por estado */}
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Distribución de Organizaciones por Estado
          </CardTitle>
          <CardDescription className="text-purple-100">
            Vista general del estado actual de todas las organizaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Barra de Activas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="font-medium text-gray-700">Activas</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${calcularPorcentaje(estadisticas.organizacionesActivas, estadisticas.totalOrganizaciones)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-right min-w-[80px]">
                <div className="font-bold text-gray-900">{estadisticas.organizacionesActivas}</div>
                <div className="text-xs text-gray-500">
                  {calcularPorcentaje(estadisticas.organizacionesActivas, estadisticas.totalOrganizaciones)}%
                </div>
              </div>
            </div>

            {/* Barra de Suspendidas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="font-medium text-gray-700">Suspendidas</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${calcularPorcentaje(estadisticas.organizacionesPendientes, estadisticas.totalOrganizaciones)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-right min-w-[80px]">
                <div className="font-bold text-gray-900">{estadisticas.organizacionesPendientes}</div>
                <div className="text-xs text-gray-500">
                  {calcularPorcentaje(estadisticas.organizacionesPendientes, estadisticas.totalOrganizaciones)}%
                </div>
              </div>
            </div>

            {/* Barra de Inactivas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="font-medium text-gray-700">Inactivas</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-gray-400 to-gray-600 h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${calcularPorcentaje(
                        estadisticas.totalOrganizaciones - estadisticas.organizacionesActivas - estadisticas.organizacionesPendientes, 
                        estadisticas.totalOrganizaciones
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-right min-w-[80px]">
                <div className="font-bold text-gray-900">
                  {estadisticas.totalOrganizaciones - estadisticas.organizacionesActivas - estadisticas.organizacionesPendientes}
                </div>
                <div className="text-xs text-gray-500">
                  {calcularPorcentaje(
                    estadisticas.totalOrganizaciones - estadisticas.organizacionesActivas - estadisticas.organizacionesPendientes, 
                    estadisticas.totalOrganizaciones
                  )}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Departamentos */}
        <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Departamentos
            </CardTitle>
            <CardDescription>Distribución geográfica de organizaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDepartamentos.map(([departamento, cantidad], index) => (
                <div key={departamento} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-700">{departamento}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{cantidad}</div>
                    <div className="text-xs text-gray-500">
                      {calcularPorcentaje(cantidad, estadisticas.totalOrganizaciones)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de organizaciones recientes */}
        <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Organizaciones Recientes</CardTitle>
            <CardDescription>Últimas organizaciones agregadas al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizaciones.slice(0, 5).map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {org.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{org.nombre}</div>
                      <div className="text-sm text-gray-500">{org.email || 'Sin email'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      org.estado === 'ACTIVA' 
                        ? 'bg-green-100 text-green-700' 
                        : org.estado === 'SUSPENDIDA'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {org.estado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

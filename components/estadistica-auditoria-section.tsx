"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, Activity } from "lucide-react"

interface EstadisticaAuditoria {
  mes: string
  auditoriasTotales: number
  auditoriasCompletadas: number
  hallazgosEncontrados: number
  tiempoPromedio: number
}

export function EstadisticaAuditoriaSection() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaAuditoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setEstadisticas([
        { mes: "Enero", auditoriasTotales: 15, auditoriasCompletadas: 12, hallazgosEncontrados: 45, tiempoPromedio: 18 },
        { mes: "Febrero", auditoriasTotales: 18, auditoriasCompletadas: 16, hallazgosEncontrados: 38, tiempoPromedio: 16 },
        { mes: "Marzo", auditoriasTotales: 22, auditoriasCompletadas: 19, hallazgosEncontrados: 52, tiempoPromedio: 20 },
        { mes: "Abril", auditoriasTotales: 25, auditoriasCompletadas: 23, hallazgosEncontrados: 41, tiempoPromedio: 15 },
        { mes: "Mayo", auditoriasTotales: 20, auditoriasCompletadas: 18, hallazgosEncontrados: 35, tiempoPromedio: 17 },
        { mes: "Junio", auditoriasTotales: 28, auditoriasCompletadas: 25, hallazgosEncontrados: 48, tiempoPromedio: 19 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getTotales = () => {
    const totalAuditorias = estadisticas.reduce((acc, stat) => acc + stat.auditoriasTotales, 0)
    const totalCompletadas = estadisticas.reduce((acc, stat) => acc + stat.auditoriasCompletadas, 0)
    const totalHallazgos = estadisticas.reduce((acc, stat) => acc + stat.hallazgosEncontrados, 0)
    const tiempoPromedioGeneral = estadisticas.length > 0 
      ? Math.round(estadisticas.reduce((acc, stat) => acc + stat.tiempoPromedio, 0) / estadisticas.length)
      : 0
    
    return { totalAuditorias, totalCompletadas, totalHallazgos, tiempoPromedioGeneral }
  }

  const calcularTasaExito = () => {
    const { totalAuditorias, totalCompletadas } = getTotales()
    return totalAuditorias > 0 ? Math.round((totalCompletadas / totalAuditorias) * 100) : 0
  }

  const totales = getTotales()
  const tasaExito = calcularTasaExito()

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Auditoría</h1>
        <p className="text-gray-600">Análisis y métricas del desempeño de auditorías</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Auditorías</p>
                <p className="text-2xl font-bold text-gray-900">{totales.totalAuditorias}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{totales.totalCompletadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Hallazgos</p>
                <p className="text-2xl font-bold text-gray-900">{totales.totalHallazgos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">{tasaExito}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Tendencias Mensuales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticas.map((stat, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{stat.mes}</h4>
                  <Badge variant="outline">
                    {Math.round((stat.auditoriasCompletadas / stat.auditoriasTotales) * 100)}% completado
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold text-lg">{stat.auditoriasTotales}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Completadas</p>
                    <p className="font-bold text-lg text-green-600">{stat.auditoriasCompletadas}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hallazgos</p>
                    <p className="font-bold text-lg text-orange-600">{stat.hallazgosEncontrados}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tiempo Promedio</p>
                    <p className="font-bold text-lg text-blue-600">{stat.tiempoPromedio} días</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Tiempo Promedio por Auditoría</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {totales.tiempoPromedioGeneral}
              </div>
              <p className="text-gray-600">días promedio</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Rango: 15-20 días es el objetivo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Distribución de Hallazgos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Críticos</span>
                <Badge className="bg-red-100 text-red-700">
                  {Math.round(totales.totalHallazgos * 0.15)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Altos</span>
                <Badge className="bg-orange-100 text-orange-700">
                  {Math.round(totales.totalHallazgos * 0.25)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medios</span>
                <Badge className="bg-yellow-100 text-yellow-700">
                  {Math.round(totales.totalHallazgos * 0.35)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bajos</span>
                <Badge className="bg-green-100 text-green-700">
                  {Math.round(totales.totalHallazgos * 0.25)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

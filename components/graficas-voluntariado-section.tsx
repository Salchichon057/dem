"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Clock, Award } from "lucide-react"

interface DatosVoluntariado {
  totalVoluntarios: number
  voluntariosActivos: number
  horasAcumuladas: number
  proyectosCompletados: number
  distribucionPorArea: Array<{
    area: string
    cantidad: number
    horas: number
  }>
  rendimientoMensual: Array<{
    mes: string
    voluntarios: number
    horas: number
    proyectos: number
  }>
  topVoluntarios: Array<{
    nombre: string
    horas: number
    proyectos: number
    area: string
  }>
}

export function GraficasVoluntariadoSection() {
  const [datos, setDatos] = useState<DatosVoluntariado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setDatos({
        totalVoluntarios: 156,
        voluntariosActivos: 123,
        horasAcumuladas: 2840,
        proyectosCompletados: 45,
        distribucionPorArea: [
          { area: "Educación", cantidad: 45, horas: 890 },
          { area: "Salud", cantidad: 38, horas: 760 },
          { area: "Medio Ambiente", cantidad: 32, horas: 650 },
          { area: "Tecnología", cantidad: 25, horas: 520 },
          { area: "Deportes", cantidad: 16, horas: 320 }
        ],
        rendimientoMensual: [
          { mes: "Enero", voluntarios: 98, horas: 420, proyectos: 6 },
          { mes: "Febrero", voluntarios: 105, horas: 485, proyectos: 8 },
          { mes: "Marzo", voluntarios: 112, horas: 520, proyectos: 9 },
          { mes: "Abril", voluntarios: 118, horas: 550, proyectos: 8 },
          { mes: "Mayo", voluntarios: 123, horas: 580, proyectos: 10 },
          { mes: "Junio", voluntarios: 129, horas: 615, proyectos: 12 }
        ],
        topVoluntarios: [
          { nombre: "María González", horas: 85, proyectos: 6, area: "Educación" },
          { nombre: "Carlos Méndez", horas: 78, proyectos: 5, area: "Salud" },
          { nombre: "Ana Rodríguez", horas: 72, proyectos: 4, area: "Medio Ambiente" },
          { nombre: "Luis Pérez", horas: 68, proyectos: 5, area: "Tecnología" },
          { nombre: "Carmen López", horas: 65, proyectos: 4, area: "Deportes" }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularPromedioHorasPorVoluntario = () => {
    if (!datos || datos.voluntariosActivos === 0) return 0
    return Math.round(datos.horasAcumuladas / datos.voluntariosActivos)
  }

  const calcularTasaActividad = () => {
    if (!datos || datos.totalVoluntarios === 0) return 0
    return Math.round((datos.voluntariosActivos / datos.totalVoluntarios) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gráficas...</p>
        </div>
      </div>
    )
  }

  if (!datos) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gráficas de Voluntariado</h1>
        <p className="text-gray-600">Análisis visual del desempeño y participación del programa de voluntariado</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Voluntarios</p>
                <p className="text-2xl font-bold text-gray-900">{datos.totalVoluntarios}</p>
                <p className="text-xs text-blue-600">{calcularTasaActividad()}% activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Horas Acumuladas</p>
                <p className="text-2xl font-bold text-gray-900">{datos.horasAcumuladas.toLocaleString()}</p>
                <p className="text-xs text-green-600">{calcularPromedioHorasPorVoluntario()} hrs/voluntario</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Proyectos Completados</p>
                <p className="text-2xl font-bold text-gray-900">{datos.proyectosCompletados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Voluntarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{datos.voluntariosActivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Área */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Distribución por Área de Trabajo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datos.distribucionPorArea.map((area, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{area.area}</span>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{area.cantidad} voluntarios</Badge>
                    <Badge className="bg-blue-100 text-blue-700">{area.horas} horas</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(area.cantidad / datos.totalVoluntarios) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((area.cantidad / datos.totalVoluntarios) * 100)}% del total
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(area.horas / datos.horasAcumuladas) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((area.horas / datos.horasAcumuladas) * 100)}% de horas
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rendimiento Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Tendencia Mensual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datos.rendimientoMensual.map((mes, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{mes.mes}</h4>
                  <Badge variant="outline">
                    {mes.proyectos} proyectos
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Voluntarios</p>
                    <p className="font-bold text-lg text-blue-600">{mes.voluntarios}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Horas</p>
                    <p className="font-bold text-lg text-green-600">{mes.horas}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Proyectos</p>
                    <p className="font-bold text-lg text-purple-600">{mes.proyectos}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Voluntarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Voluntarios Destacados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {datos.topVoluntarios.map((voluntario, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-purple-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{voluntario.nombre}</p>
                    <p className="text-sm text-gray-600">{voluntario.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-2">
                    <Badge className="bg-green-100 text-green-700">
                      {voluntario.horas} hrs
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {voluntario.proyectos} proyectos
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

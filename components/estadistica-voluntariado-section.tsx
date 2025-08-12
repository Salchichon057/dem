"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, TrendingUp, Award, BarChart3, Activity } from "lucide-react"

interface EstadisticaVoluntariado {
  resumenGeneral: {
    totalVoluntarios: number
    voluntariosActivos: number
    horasAcumuladas: number
    proyectosCompletados: number
    impactoPersonas: number
    tasaRetencion: number
  }
  porArea: Array<{
    area: string
    voluntarios: number
    horasPromedio: number
    satisfaccion: number
    proyectosActivos: number
  }>
  rendimientoTemporal: Array<{
    periodo: string
    nuevosVoluntarios: number
    horasContribuidas: number
    proyectosIniciados: number
    tasa_completacion: number
  }>
  metricas: {
    edadPromedio: number
    generoDistribucion: { masculino: number; femenino: number; otro: number }
    experienciaPrevia: { con: number; sin: number }
    tiempoPromedioActividad: number
  }
}

export function EstadisticaVoluntariadoSection() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaVoluntariado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setEstadisticas({
        resumenGeneral: {
          totalVoluntarios: 156,
          voluntariosActivos: 123,
          horasAcumuladas: 3450,
          proyectosCompletados: 45,
          impactoPersonas: 1250,
          tasaRetencion: 78
        },
        porArea: [
          { area: "Educación", voluntarios: 45, horasPromedio: 18, satisfaccion: 92, proyectosActivos: 8 },
          { area: "Salud", voluntarios: 38, horasPromedio: 20, satisfaccion: 88, proyectosActivos: 6 },
          { area: "Medio Ambiente", voluntarios: 32, horasPromedio: 15, satisfaccion: 85, proyectosActivos: 5 },
          { area: "Tecnología", voluntarios: 25, horasPromedio: 22, satisfaccion: 94, proyectosActivos: 4 },
          { area: "Deportes", voluntarios: 16, horasPromedio: 12, satisfaccion: 90, proyectosActivos: 3 }
        ],
        rendimientoTemporal: [
          { periodo: "Enero", nuevosVoluntarios: 12, horasContribuidas: 420, proyectosIniciados: 3, tasa_completacion: 85 },
          { periodo: "Febrero", nuevosVoluntarios: 18, horasContribuidas: 485, proyectosIniciados: 4, tasa_completacion: 90 },
          { periodo: "Marzo", nuevosVoluntarios: 15, horasContribuidas: 520, proyectosIniciados: 5, tasa_completacion: 88 },
          { periodo: "Abril", nuevosVoluntarios: 22, horasContribuidas: 580, proyectosIniciados: 6, tasa_completacion: 92 },
          { periodo: "Mayo", nuevosVoluntarios: 19, horasContribuidas: 615, proyectosIniciados: 4, tasa_completacion: 87 },
          { periodo: "Junio", nuevosVoluntarios: 16, horasContribuidas: 650, proyectosIniciados: 7, tasa_completacion: 91 }
        ],
        metricas: {
          edadPromedio: 28,
          generoDistribucion: { masculino: 68, femenino: 82, otro: 6 },
          experienciaPrevia: { con: 95, sin: 61 },
          tiempoPromedioActividad: 8.5
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularTasaActividad = () => {
    if (!estadisticas) return 0
    return Math.round((estadisticas.resumenGeneral.voluntariosActivos / estadisticas.resumenGeneral.totalVoluntarios) * 100)
  }

  const calcularImpactoPorVoluntario = () => {
    if (!estadisticas || estadisticas.resumenGeneral.voluntariosActivos === 0) return 0
    return Math.round(estadisticas.resumenGeneral.impactoPersonas / estadisticas.resumenGeneral.voluntariosActivos)
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

  if (!estadisticas) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Voluntariado</h1>
        <p className="text-gray-600">Análisis detallado del programa de voluntariado y su impacto</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estadisticas.resumenGeneral.totalVoluntarios}</p>
              <p className="text-xs text-gray-600">Total Voluntarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estadisticas.resumenGeneral.voluntariosActivos}</p>
              <p className="text-xs text-gray-600">Activos ({calcularTasaActividad()}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estadisticas.resumenGeneral.horasAcumuladas.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Horas Acumuladas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estadisticas.resumenGeneral.proyectosCompletados}</p>
              <p className="text-xs text-gray-600">Proyectos Completados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estadisticas.resumenGeneral.impactoPersonas.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Personas Impactadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{estadisticas.resumenGeneral.tasaRetencion}%</p>
              <p className="text-xs text-gray-600">Tasa Retención</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por Área */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Rendimiento por Área</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticas.porArea.map((area, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-lg">{area.area}</h4>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{area.voluntarios} voluntarios</Badge>
                    <Badge className="bg-green-100 text-green-700">{area.proyectosActivos} proyectos activos</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Horas Promedio/Voluntario</p>
                    <p className="text-xl font-bold text-blue-600">{area.horasPromedio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Satisfacción</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={area.satisfaccion} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{area.satisfaccion}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Impacto por Voluntario</p>
                    <p className="text-xl font-bold text-purple-600">{calcularImpactoPorVoluntario()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencia Temporal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Tendencia de Actividad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticas.rendimientoTemporal.map((periodo, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{periodo.periodo}</h4>
                  <Badge className={`${
                    periodo.tasa_completacion >= 90 ? 'bg-green-100 text-green-700' :
                    periodo.tasa_completacion >= 85 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {periodo.tasa_completacion}% completación
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nuevos Voluntarios</p>
                    <p className="font-bold text-lg text-blue-600">{periodo.nuevosVoluntarios}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Horas Contribuidas</p>
                    <p className="font-bold text-lg text-green-600">{periodo.horasContribuidas}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Proyectos Iniciados</p>
                    <p className="font-bold text-lg text-purple-600">{periodo.proyectosIniciados}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Eficiencia</p>
                    <p className="font-bold text-lg text-orange-600">
                      {Math.round(periodo.horasContribuidas / periodo.nuevosVoluntarios)} hrs/vol
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demografía y Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil Demográfico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Edad Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.metricas.edadPromedio} años</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Distribución por Género</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Femenino</span>
                    <Badge>{estadisticas.metricas.generoDistribucion.femenino}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Masculino</span>
                    <Badge>{estadisticas.metricas.generoDistribucion.masculino}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Otro</span>
                    <Badge>{estadisticas.metricas.generoDistribucion.otro}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experiencia y Permanencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Experiencia Previa en Voluntariado</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Con experiencia</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: `${(estadisticas.metricas.experienciaPrevia.con / estadisticas.resumenGeneral.totalVoluntarios) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <Badge>{estadisticas.metricas.experienciaPrevia.con}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sin experiencia</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(estadisticas.metricas.experienciaPrevia.sin / estadisticas.resumenGeneral.totalVoluntarios) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <Badge>{estadisticas.metricas.experienciaPrevia.sin}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio de Actividad</p>
                <p className="text-2xl font-bold text-purple-600">{estadisticas.metricas.tiempoPromedioActividad} meses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

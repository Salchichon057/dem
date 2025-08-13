"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Building2, MapPin, FileText, Heart, UserPlus } from "lucide-react"

interface EstadisticasAdmin {
  resumenGeneral: {
    totalComunidades: number
    totalOrganizaciones: number
    totalBeneficiarios: number
    totalVoluntarios: number
    totalFormularios: number
    totalAuditorias: number
  }
  crecimientoMensual: Array<{
    mes: string
    comunidades: number
    beneficiarios: number
    voluntarios: number
    formularios: number
  }>
  distribucionProgramas: Array<{
    programa: string
    beneficiarios: number
    porcentaje: number
  }>
  rendimientoVoluntarios: {
    horasTotales: number
    promedioHorasPorVoluntario: number
    voluntariosActivos: number
    tasaRetencion: number
  }
  indicadoresCalidad: {
    satisfaccionBeneficiarios: number
    completitudFormularios: number
    participacionComunitaria: number
    efectividadProgramas: number
  }
}

export function AdminEstadisticasSection() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo - aquí conectarías con tu API
      setEstadisticas({
        resumenGeneral: {
          totalComunidades: 24,
          totalOrganizaciones: 8,
          totalBeneficiarios: 456,
          totalVoluntarios: 89,
          totalFormularios: 23,
          totalAuditorias: 12
        },
        crecimientoMensual: [
          { mes: "Enero", comunidades: 20, beneficiarios: 380, voluntarios: 65, formularios: 18 },
          { mes: "Febrero", comunidades: 21, beneficiarios: 405, voluntarios: 72, formularios: 20 },
          { mes: "Marzo", comunidades: 22, beneficiarios: 428, voluntarios: 78, formularios: 21 },
          { mes: "Abril", comunidades: 23, beneficiarios: 445, voluntarios: 83, formularios: 22 },
          { mes: "Mayo", comunidades: 24, beneficiarios: 456, voluntarios: 89, formularios: 23 }
        ],
        distribucionProgramas: [
          { programa: "Abrazando Leyendas", beneficiarios: 156, porcentaje: 34.2 },
          { programa: "Desarrollo Comunitario", beneficiarios: 98, porcentaje: 21.5 },
          { programa: "Educación Integral", beneficiarios: 87, porcentaje: 19.1 },
          { programa: "Salud Preventiva", beneficiarios: 65, porcentaje: 14.3 },
          { programa: "Capacitación Laboral", beneficiarios: 35, porcentaje: 7.7 },
          { programa: "Otros", beneficiarios: 15, porcentaje: 3.3 }
        ],
        rendimientoVoluntarios: {
          horasTotales: 3250,
          promedioHorasPorVoluntario: 36.5,
          voluntariosActivos: 76,
          tasaRetencion: 85.4
        },
        indicadoresCalidad: {
          satisfaccionBeneficiarios: 92.5,
          completitudFormularios: 88.3,
          participacionComunitaria: 76.8,
          efectividadProgramas: 89.2
        }
      })
    } finally {
      setLoading(false)
    }
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
        <h2 className="text-xl font-bold text-gray-900">Estadísticas Generales</h2>
        <p className="text-gray-600">Panel de control con métricas clave del sistema</p>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{estadisticas.resumenGeneral.totalComunidades}</p>
            <p className="text-xs text-blue-600">Comunidades</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{estadisticas.resumenGeneral.totalOrganizaciones}</p>
            <p className="text-xs text-green-600">Organizaciones</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{estadisticas.resumenGeneral.totalBeneficiarios}</p>
            <p className="text-xs text-purple-600">Beneficiarios</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <UserPlus className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{estadisticas.resumenGeneral.totalVoluntarios}</p>
            <p className="text-xs text-orange-600">Voluntarios</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-pink-700">{estadisticas.resumenGeneral.totalFormularios}</p>
            <p className="text-xs text-pink-600">Formularios</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-700">{estadisticas.resumenGeneral.totalAuditorias}</p>
            <p className="text-xs text-indigo-600">Auditorías</p>
          </CardContent>
        </Card>
      </div>

      {/* Crecimiento Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Tendencia de Crecimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticas.crecimientoMensual.map((mes, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-lg">{mes.mes}</h4>
                  <Badge className="bg-blue-100 text-blue-700">
                    +{index > 0 ? mes.beneficiarios - estadisticas.crecimientoMensual[index - 1].beneficiarios : 0} beneficiarios
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Comunidades</p>
                    <p className="text-xl font-bold text-blue-600">{mes.comunidades}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Beneficiarios</p>
                    <p className="text-xl font-bold text-purple-600">{mes.beneficiarios}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Voluntarios</p>
                    <p className="text-xl font-bold text-orange-600">{mes.voluntarios}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Formularios</p>
                    <p className="text-xl font-bold text-pink-600">{mes.formularios}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Programas y Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Distribución por Programas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estadisticas.distribucionProgramas.map((programa, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{programa.programa}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{programa.beneficiarios}</span>
                      <Badge variant="outline">{programa.porcentaje}%</Badge>
                    </div>
                  </div>
                  <Progress value={programa.porcentaje} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Rendimiento de Voluntarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.rendimientoVoluntarios.horasTotales.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Horas Totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{estadisticas.rendimientoVoluntarios.promedioHorasPorVoluntario}</p>
                  <p className="text-sm text-gray-600">Promedio/Voluntario</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Voluntarios Activos</span>
                    <span className="text-sm font-medium">{estadisticas.rendimientoVoluntarios.voluntariosActivos}/{estadisticas.resumenGeneral.totalVoluntarios}</span>
                  </div>
                  <Progress value={(estadisticas.rendimientoVoluntarios.voluntariosActivos / estadisticas.resumenGeneral.totalVoluntarios) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Tasa de Retención</span>
                    <span className="text-sm font-medium">{estadisticas.rendimientoVoluntarios.tasaRetencion}%</span>
                  </div>
                  <Progress value={estadisticas.rendimientoVoluntarios.tasaRetencion} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Calidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Indicadores de Calidad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Satisfacción Beneficiarios</span>
                <span className="text-sm font-bold text-green-600">{estadisticas.indicadoresCalidad.satisfaccionBeneficiarios}%</span>
              </div>
              <Progress value={estadisticas.indicadoresCalidad.satisfaccionBeneficiarios} className="h-3" />
              <p className="text-xs text-gray-500">Excelente</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completitud Formularios</span>
                <span className="text-sm font-bold text-blue-600">{estadisticas.indicadoresCalidad.completitudFormularios}%</span>
              </div>
              <Progress value={estadisticas.indicadoresCalidad.completitudFormularios} className="h-3" />
              <p className="text-xs text-gray-500">Muy bueno</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Participación Comunitaria</span>
                <span className="text-sm font-bold text-orange-600">{estadisticas.indicadoresCalidad.participacionComunitaria}%</span>
              </div>
              <Progress value={estadisticas.indicadoresCalidad.participacionComunitaria} className="h-3" />
              <p className="text-xs text-gray-500">Bueno</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Efectividad Programas</span>
                <span className="text-sm font-bold text-purple-600">{estadisticas.indicadoresCalidad.efectividadProgramas}%</span>
              </div>
              <Progress value={estadisticas.indicadoresCalidad.efectividadProgramas} className="h-3" />
              <p className="text-xs text-gray-500">Excelente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

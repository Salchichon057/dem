"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, TrendingUp, MapPin, Award, Activity } from "lucide-react"

interface EstadisticaLeyendas {
  totalBeneficiarios: number
  beneficiariosActivos: number
  beneficiariosGraduados: number
  edadPromedio: number
  distribucionGenero: {
    masculino: number
    femenino: number
    otro: number
  }
  beneficiariosPorComunidad: Array<{
    comunidad: string
    cantidad: number
  }>
  tiposApoyoMasComunes: Array<{
    tipo: string
    cantidad: number
  }>
  tendenciaMensual: Array<{
    mes: string
    nuevos: number
    graduados: number
  }>
}

export function EstadisticaLeyendasSection() {
  const [estadisticas, setEstadisticas] = useState<EstadisticaLeyendas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setEstadisticas({
        totalBeneficiarios: 245,
        beneficiariosActivos: 180,
        beneficiariosGraduados: 65,
        edadPromedio: 76,
        distribucionGenero: {
          masculino: 95,
          femenino: 140,
          otro: 10
        },
        beneficiariosPorComunidad: [
          { comunidad: "San José Poaquil", cantidad: 85 },
          { comunidad: "Villas del Quetzal", cantidad: 72 },
          { comunidad: "Aldea Central", cantidad: 45 },
          { comunidad: "Zona Rural Norte", cantidad: 28 },
          { comunidad: "Barrio El Progreso", cantidad: 15 }
        ],
        tiposApoyoMasComunes: [
          { tipo: "Alimentación", cantidad: 220 },
          { tipo: "Compañía", cantidad: 180 },
          { tipo: "Cuidado médico", cantidad: 145 },
          { tipo: "Transporte", cantidad: 98 },
          { tipo: "Actividades recreativas", cantidad: 75 },
          { tipo: "Apoyo doméstico", cantidad: 55 }
        ],
        tendenciaMensual: [
          { mes: "Enero", nuevos: 12, graduados: 8 },
          { mes: "Febrero", nuevos: 15, graduados: 6 },
          { mes: "Marzo", nuevos: 18, graduados: 10 },
          { mes: "Abril", nuevos: 22, graduados: 12 },
          { mes: "Mayo", nuevos: 16, graduados: 9 },
          { mes: "Junio", nuevos: 14, graduados: 7 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularPorcentajeActividad = () => {
    if (!estadisticas) return 0
    return Math.round((estadisticas.beneficiariosActivos / estadisticas.totalBeneficiarios) * 100)
  }

  const calcularTasaGraduacion = () => {
    if (!estadisticas) return 0
    return Math.round((estadisticas.beneficiariosGraduados / estadisticas.totalBeneficiarios) * 100)
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
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas Abrazando Leyendas</h1>
        <p className="text-gray-600">Análisis integral del programa de apoyo a adultos mayores</p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Beneficiarios</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalBeneficiarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.beneficiariosActivos}</p>
                <p className="text-xs text-green-600">{calcularPorcentajeActividad()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Graduados</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.beneficiariosGraduados}</p>
                <p className="text-xs text-blue-600">{calcularTasaGraduacion()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Edad Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.edadPromedio}</p>
                <p className="text-xs text-purple-600">años</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Género */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Distribución por Género</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {estadisticas.distribucionGenero.masculino}
              </div>
              <p className="text-sm text-gray-600">Masculino</p>
              <p className="text-xs text-gray-500">
                {Math.round((estadisticas.distribucionGenero.masculino / estadisticas.totalBeneficiarios) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">
                {estadisticas.distribucionGenero.femenino}
              </div>
              <p className="text-sm text-gray-600">Femenino</p>
              <p className="text-xs text-gray-500">
                {Math.round((estadisticas.distribucionGenero.femenino / estadisticas.totalBeneficiarios) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {estadisticas.distribucionGenero.otro}
              </div>
              <p className="text-sm text-gray-600">Otro</p>
              <p className="text-xs text-gray-500">
                {Math.round((estadisticas.distribucionGenero.otro / estadisticas.totalBeneficiarios) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiarios por Comunidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Beneficiarios por Comunidad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estadisticas.beneficiariosPorComunidad.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{item.comunidad}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(item.cantidad / estadisticas.totalBeneficiarios) * 100}%` }}
                    ></div>
                  </div>
                  <Badge variant="outline">{item.cantidad}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Apoyo Más Comunes */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Apoyo Más Solicitados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estadisticas.tiposApoyoMasComunes.map((tipo, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{tipo.tipo}</p>
                  <p className="text-sm text-gray-600">
                    {Math.round((tipo.cantidad / estadisticas.totalBeneficiarios) * 100)}% de beneficiarios
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                  {tipo.cantidad}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencia Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Tendencia Mensual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticas.tendenciaMensual.map((mes, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{mes.mes}</h4>
                  <div className="flex space-x-2">
                    <Badge className="bg-green-100 text-green-700">
                      +{mes.nuevos} nuevos
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {mes.graduados} graduados
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Ingresaron</p>
                    <p className="font-bold text-lg text-green-600">{mes.nuevos}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Se graduaron</p>
                    <p className="font-bold text-lg text-blue-600">{mes.graduados}</p>
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

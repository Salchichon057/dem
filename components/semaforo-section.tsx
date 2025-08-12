"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react"

interface IndicadorSemaforo {
  id: string
  categoria: string
  indicador: string
  valor: number
  meta: number
  estado: "verde" | "amarillo" | "rojo"
  tendencia: "subiendo" | "bajando" | "estable"
  descripcion: string
}

export function SemaforoSection() {
  const [indicadores, setIndicadores] = useState<IndicadorSemaforo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarIndicadores()
  }, [])

  const cargarIndicadores = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setIndicadores([
        {
          id: "1",
          categoria: "Cumplimiento",
          indicador: "Auditorías Completadas a Tiempo",
          valor: 85,
          meta: 90,
          estado: "amarillo",
          tendencia: "subiendo",
          descripcion: "Porcentaje de auditorías completadas dentro del plazo establecido"
        },
        {
          id: "2",
          categoria: "Calidad",
          indicador: "Satisfacción del Cliente",
          valor: 92,
          meta: 85,
          estado: "verde",
          tendencia: "estable",
          descripcion: "Nivel de satisfacción promedio de las organizaciones auditadas"
        },
        {
          id: "3",
          categoria: "Eficiencia",
          indicador: "Tiempo Promedio de Auditoría",
          valor: 22,
          meta: 18,
          estado: "rojo",
          tendencia: "bajando",
          descripcion: "Días promedio para completar una auditoría completa"
        },
        {
          id: "4",
          categoria: "Hallazgos",
          indicador: "Resolución de Hallazgos Críticos",
          valor: 78,
          meta: 95,
          estado: "rojo",
          tendencia: "subiendo",
          descripcion: "Porcentaje de hallazgos críticos resueltos en tiempo adecuado"
        },
        {
          id: "5",
          categoria: "Recursos",
          indicador: "Utilización de Auditores",
          valor: 88,
          meta: 80,
          estado: "verde",
          tendencia: "estable",
          descripcion: "Porcentaje de utilización efectiva del equipo de auditores"
        },
        {
          id: "6",
          categoria: "Riesgo",
          indicador: "Auditorías de Alto Riesgo",
          valor: 15,
          meta: 10,
          estado: "amarillo",
          tendencia: "bajando",
          descripcion: "Porcentaje de auditorías clasificadas como alto riesgo"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "verde": return "text-green-600 bg-green-100"
      case "amarillo": return "text-yellow-600 bg-yellow-100"
      case "rojo": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "verde": return <CheckCircle className="h-8 w-8 text-green-600" />
      case "amarillo": return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case "rojo": return <XCircle className="h-8 w-8 text-red-600" />
      default: return <Clock className="h-8 w-8 text-gray-600" />
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    const baseClass = "h-4 w-4"
    switch (tendencia) {
      case "subiendo": return <TrendingUp className={`${baseClass} text-green-600 rotate-0`} />
      case "bajando": return <TrendingUp className={`${baseClass} text-red-600 rotate-180`} />
      case "estable": return <TrendingUp className={`${baseClass} text-gray-600 rotate-90`} />
      default: return <TrendingUp className={`${baseClass} text-gray-600`} />
    }
  }

  const contarPorEstado = () => {
    const verde = indicadores.filter(i => i.estado === "verde").length
    const amarillo = indicadores.filter(i => i.estado === "amarillo").length
    const rojo = indicadores.filter(i => i.estado === "rojo").length
    return { verde, amarillo, rojo }
  }

  const estados = contarPorEstado()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando semáforo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Semáforo de Indicadores</h1>
        <p className="text-gray-600">Monitor en tiempo real del estado de los indicadores clave</p>
      </div>

      {/* Resumen de Estados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Indicadores Verdes</p>
                <p className="text-2xl font-bold text-green-600">{estados.verde}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Indicadores Amarillos</p>
                <p className="text-2xl font-bold text-yellow-600">{estados.amarillo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Indicadores Rojos</p>
                <p className="text-2xl font-bold text-red-600">{estados.rojo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tablero de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {indicadores.map((indicador) => (
          <Card key={indicador.id} className={`border-l-4 ${
            indicador.estado === "verde" ? "border-l-green-500" :
            indicador.estado === "amarillo" ? "border-l-yellow-500" :
            "border-l-red-500"
          }`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">
                    {indicador.categoria}
                  </Badge>
                  <CardTitle className="text-lg">{indicador.indicador}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{indicador.descripcion}</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  {getEstadoIcon(indicador.estado)}
                  <div className="flex items-center space-x-1">
                    {getTendenciaIcon(indicador.tendencia)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Valor Principal */}
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    indicador.estado === "verde" ? "text-green-600" :
                    indicador.estado === "amarillo" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {indicador.valor}
                    {indicador.categoria === "Cumplimiento" || indicador.categoria === "Calidad" || 
                     indicador.categoria === "Recursos" || indicador.categoria === "Riesgo" ? "%" : 
                     indicador.categoria === "Eficiencia" ? " días" : ""}
                  </div>
                  <p className="text-sm text-gray-600">
                    Meta: {indicador.meta}
                    {indicador.categoria === "Cumplimiento" || indicador.categoria === "Calidad" || 
                     indicador.categoria === "Recursos" || indicador.categoria === "Riesgo" ? "%" : 
                     indicador.categoria === "Eficiencia" ? " días" : ""}
                  </p>
                </div>

                {/* Barra de Progreso Visual */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      indicador.estado === "verde" ? "bg-green-500" :
                      indicador.estado === "amarillo" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ 
                      width: indicador.categoria === "Eficiencia" 
                        ? `${Math.min((indicador.meta / indicador.valor) * 100, 100)}%`
                        : `${Math.min((indicador.valor / indicador.meta) * 100, 100)}%`
                    }}
                  ></div>
                </div>

                {/* Estado y Tendencia */}
                <div className="flex justify-between items-center">
                  <Badge className={getEstadoColor(indicador.estado)}>
                    {indicador.estado.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600 capitalize">
                    Tendencia: {indicador.tendencia}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

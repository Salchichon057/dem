"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"

interface ResumenAuditoria {
  id: string
  organizacion: string
  tipo: string
  estado: "completado" | "en-progreso" | "pendiente" | "atrasado"
  progreso: number
  fechaInicio: string
  fechaLimite: string
  responsable: string
  hallazgos: number
  riesgo: "alto" | "medio" | "bajo"
}

export function TableroConsolidadoSection() {
  const [auditorias, setAuditorias] = useState<ResumenAuditoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setAuditorias([
        {
          id: "1",
          organizacion: "Fundación Ruta de Alimentos",
          tipo: "Auditoría Financiera",
          estado: "completado",
          progreso: 100,
          fechaInicio: "2025-01-15",
          fechaLimite: "2025-02-15",
          responsable: "María González",
          hallazgos: 3,
          riesgo: "bajo"
        },
        {
          id: "2",
          organizacion: "Programa Abrazando Leyendas",
          tipo: "Evaluación de Procesos",
          estado: "en-progreso",
          progreso: 65,
          fechaInicio: "2025-01-20",
          fechaLimite: "2025-02-20",
          responsable: "Carlos Méndez",
          hallazgos: 5,
          riesgo: "medio"
        },
        {
          id: "3",
          organizacion: "Voluntariado Comunitario",
          tipo: "Auditoría Operativa",
          estado: "atrasado",
          progreso: 30,
          fechaInicio: "2025-01-10",
          fechaLimite: "2025-01-30",
          responsable: "Ana Rodríguez",
          hallazgos: 8,
          riesgo: "alto"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const styles = {
      completado: "bg-green-100 text-green-700",
      "en-progreso": "bg-blue-100 text-blue-700",
      pendiente: "bg-yellow-100 text-yellow-700",
      atrasado: "bg-red-100 text-red-700"
    }
    return styles[estado as keyof typeof styles] || "bg-gray-100 text-gray-700"
  }

  const getRiesgoBadge = (riesgo: string) => {
    const styles = {
      alto: "bg-red-100 text-red-700",
      medio: "bg-yellow-100 text-yellow-700",
      bajo: "bg-green-100 text-green-700"
    }
    return styles[riesgo as keyof typeof styles] || "bg-gray-100 text-gray-700"
  }

  const getEstadisticas = () => {
    const completadas = auditorias.filter(a => a.estado === "completado").length
    const enProgreso = auditorias.filter(a => a.estado === "en-progreso").length
    const atrasadas = auditorias.filter(a => a.estado === "atrasado").length
    const totalHallazgos = auditorias.reduce((acc, a) => acc + a.hallazgos, 0)
    
    return { completadas, enProgreso, atrasadas, totalHallazgos }
  }

  const stats = getEstadisticas()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tablero...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tablero Consolidado de Auditorías</h1>
        <p className="text-gray-600">Vista general del estado de todas las auditorías en curso</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enProgreso}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.atrasadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Hallazgos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHallazgos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auditorías en Curso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {auditorias.map((auditoria) => (
          <Card key={auditoria.id} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{auditoria.organizacion}</CardTitle>
                  <p className="text-sm text-gray-600">{auditoria.tipo}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getEstadoBadge(auditoria.estado)}>
                    {auditoria.estado.replace("-", " ")}
                  </Badge>
                  <Badge className={getRiesgoBadge(auditoria.riesgo)}>
                    Riesgo {auditoria.riesgo}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progreso */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso</span>
                    <span>{auditoria.progreso}%</span>
                  </div>
                  <Progress value={auditoria.progreso} className="h-2" />
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Responsable</p>
                    <p className="font-medium">{auditoria.responsable}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hallazgos</p>
                    <p className="font-medium">{auditoria.hallazgos}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fecha Inicio</p>
                    <p className="font-medium">{new Date(auditoria.fechaInicio).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fecha Límite</p>
                    <p className="font-medium">{new Date(auditoria.fechaLimite).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen de Riesgos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Distribución de Riesgos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {auditorias.filter(a => a.riesgo === "alto").length}
              </div>
              <p className="text-sm text-gray-600">Riesgo Alto</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {auditorias.filter(a => a.riesgo === "medio").length}
              </div>
              <p className="text-sm text-gray-600">Riesgo Medio</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {auditorias.filter(a => a.riesgo === "bajo").length}
              </div>
              <p className="text-sm text-gray-600">Riesgo Bajo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

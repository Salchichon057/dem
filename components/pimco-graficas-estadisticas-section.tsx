'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, PieChart, LineChart, Users, MapPin, Activity, Calendar, UserCheck, Briefcase, Loader2 } from 'lucide-react'

interface EstadisticasPimco {
  resumenGeneral: {
    totalEntrevistas: number
    totalComunidades: number
    encuestadoresActivos: number
    periodoInicio: string
    periodoFin: string
  }
  entrevistasPorEstado: Array<{
    estadoVisita: string
    _count: { id: number }
  }>
  distribucionSexo: Array<{
    sexoEntrevistado: string
    _count: { id: number }
  }>
  ocupaciones: Array<{
    ocupacionJefeHogar: string
    _count: { id: number }
  }>
  comunidadesActividad: Array<{
    id: string
    nombreComunidad: string
    coordinadorComunitario: string
    _count: { entrevistas: number }
  }>
}

export function PimcoGraficasEstadisticasSection() {
  const [selectedTab, setSelectedTab] = useState('resumen')
  const [filtroFecha, setFiltroFecha] = useState('todos')
  const [estadisticas, setEstadisticas] = useState<EstadisticasPimco | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar estadísticas desde la API
  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/estadisticas-pimco')
      if (!response.ok) throw new Error('Error al cargar estadísticas')
      
      const data = await response.json()
      setEstadisticas(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  if (loading || !estadisticas) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando estadísticas...</span>
      </div>
    )
  }

  // Procesar datos para mostrar
  const entrevistasPorTipo = estadisticas.entrevistasPorEstado.reduce((acc, item) => {
    const tipo = item.estadoVisita === 'PRIMERA_VISITA' ? 'primeraVisita' :
                 item.estadoVisita === 'VISITA_SEGUIMIENTO' ? 'visitaSegundo' : 'visitaSeguimiento'
    acc[tipo] = item._count.id
    return acc
  }, { primeraVisita: 0, visitaSegundo: 0, visitaSeguimiento: 0 })

  const sexoData = estadisticas.distribucionSexo.reduce((acc, item) => {
    const sexoKey = item.sexoEntrevistado.toLowerCase() as keyof typeof acc
    if (sexoKey in acc) {
      acc[sexoKey] = item._count.id
    }
    return acc
  }, { femenino: 0, masculino: 0 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">PIMCO - Gráficas y Estadísticas</h2>
            <p className="text-muted-foreground">
              Análisis de entrevistas y visitas comunitarias
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filtroFecha} onValueChange={setFiltroFecha}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los períodos</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="ultimo-mes">Último mes</SelectItem>
              <SelectItem value="ultimo-trimestre">Último trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Entrevistas</p>
                <p className="text-2xl font-bold">{estadisticas.resumenGeneral.totalEntrevistas}</p>
                <p className="text-xs text-green-600">Datos reales de BD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Comunidades Visitadas</p>
                <p className="text-2xl font-bold">{estadisticas.resumenGeneral.totalComunidades}</p>
                <p className="text-xs text-blue-600">100% de cobertura</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Encuestadores Activos</p>
                <p className="text-2xl font-bold">{estadisticas.resumenGeneral.encuestadoresActivos}</p>
                <p className="text-xs text-gray-600">En primera visita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tasa de Seguimiento</p>
                <p className="text-2xl font-bold">
                  {entrevistasPorTipo.primeraVisita > 0 ? 
                    Math.round((entrevistasPorTipo.visitaSegundo / entrevistasPorTipo.primeraVisita) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-green-600">Excelente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de análisis */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="comunidades">Por Comunidad</TabsTrigger>
          <TabsTrigger value="demograficos">Demográficos</TabsTrigger>
          <TabsTrigger value="temporal">Evolución</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Estado de Visitas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Estado de Visitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Primera Visita</span>
                    <span className="font-bold">{entrevistasPorTipo.primeraVisita}</span>
                  </div>
                  <Progress value={(entrevistasPorTipo.primeraVisita / estadisticas.resumenGeneral.totalEntrevistas) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Visita de Seguimiento</span>
                    <span className="font-bold">{entrevistasPorTipo.visitaSegundo}</span>
                  </div>
                  <Progress value={(entrevistasPorTipo.visitaSegundo / estadisticas.resumenGeneral.totalEntrevistas) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seguimiento Adicional</span>
                    <span className="font-bold">{entrevistasPorTipo.visitaSeguimiento}</span>
                  </div>
                  <Progress value={(entrevistasPorTipo.visitaSeguimiento / estadisticas.resumenGeneral.totalEntrevistas) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Sexo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Sexo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Femenino</span>
                    <span className="font-bold">{sexoData.femenino}</span>
                  </div>
                  <Progress value={(sexoData.femenino / estadisticas.resumenGeneral.totalEntrevistas) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Masculino</span>
                    <span className="font-bold">{sexoData.masculino}</span>
                  </div>
                  <Progress value={(sexoData.masculino / estadisticas.resumenGeneral.totalEntrevistas) * 100} className="h-2" />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    {Math.round((sexoData.femenino / estadisticas.resumenGeneral.totalEntrevistas) * 100)}% de participación femenina
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Por Comunidad */}
        <TabsContent value="comunidades" className="space-y-4">
          <div className="grid gap-4">
            {estadisticas.comunidadesActividad.map((comunidad, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{comunidad.nombreComunidad}</CardTitle>
                      <CardDescription>Coordinador: {comunidad.coordinadorComunitario}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {comunidad._count.entrevistas} entrevistas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{comunidad._count.entrevistas}</div>
                      <div className="text-sm text-gray-600">Total Entrevistas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((comunidad._count.entrevistas / estadisticas.resumenGeneral.totalEntrevistas) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Participación</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">Activa</div>
                      <div className="text-sm text-gray-600">Estado</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Demográficos */}
        <TabsContent value="demograficos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ocupaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Ocupaciones Principales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {estadisticas.ocupaciones.slice(0, 5).map((ocupacion) => (
                  <div key={ocupacion.ocupacionJefeHogar} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{ocupacion.ocupacionJefeHogar}</span>
                      <span className="font-bold">{ocupacion._count.id}</span>
                    </div>
                    <Progress 
                      value={(ocupacion._count.id / estadisticas.resumenGeneral.totalEntrevistas) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Distribución por Sexo Detallada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Análisis de Género
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {estadisticas.distribucionSexo.map((sexo) => (
                  <div key={sexo.sexoEntrevistado} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{sexo.sexoEntrevistado}</span>
                      <span className="font-bold">{sexo._count.id}</span>
                    </div>
                    <Progress 
                      value={(sexo._count.id / estadisticas.resumenGeneral.totalEntrevistas) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Evolución Temporal */}
        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Datos en Tiempo Real
              </CardTitle>
              <CardDescription>
                Información actualizada desde la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Período Actual</h4>
                    <Badge variant="outline">{estadisticas.resumenGeneral.totalEntrevistas} entrevistas</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Desde: </span>
                      <span className="font-bold">{estadisticas.resumenGeneral.periodoInicio}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hasta: </span>
                      <span className="font-bold">{estadisticas.resumenGeneral.periodoFin}</span>
                    </div>
                  </div>
                  <Progress 
                    value={100} 
                    className="mt-2 h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PimcoGraficasEstadisticasSection

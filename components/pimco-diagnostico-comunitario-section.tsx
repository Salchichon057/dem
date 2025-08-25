'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Activity, Plus, Edit, MapPin, Users, FileText, Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

const diagnosticosPimco = [
  {
    id: 1,
    comunidad: 'Comunidad San José',
    region: 'Norte',
    fechaInicio: '2024-01-10',
    fechaFinalizacion: '2024-02-15',
    estado: 'completado',
    progreso: 100,
    responsable: 'Dr. Carlos Mendoza',
    equipo: ['Ana Rodríguez', 'Miguel Torres', 'Sofía Vargas'],
    areas: [
      { nombre: 'Salud', puntuacion: 75, prioridad: 'media' },
      { nombre: 'Educación', puntuacion: 60, prioridad: 'alta' },
      { nombre: 'Infraestructura', puntuacion: 45, prioridad: 'crítica' },
      { nombre: 'Economía Local', puntuacion: 55, prioridad: 'alta' },
      { nombre: 'Organización Social', puntuacion: 80, prioridad: 'baja' }
    ],
    hallazgos: [
      'Necesidad urgente de mejoras en el sistema de agua potable',
      'Falta de espacios educativos adecuados para adolescentes',
      'Fuerte cohesión social y liderazgo comunitario'
    ],
    recomendaciones: [
      'Implementar proyecto de agua potable como prioridad',
      'Desarrollar centro educativo comunitario',
      'Fortalecer programas de capacitación técnica'
    ]
  },
  {
    id: 2,
    comunidad: 'Comunidad Las Flores',
    region: 'Sur',
    fechaInicio: '2024-02-01',
    fechaFinalizacion: '2024-03-10',
    estado: 'en_progreso',
    progreso: 65,
    responsable: 'Dra. Patricia López',
    equipo: ['Roberto Silva', 'Carmen Medina'],
    areas: [
      { nombre: 'Salud', puntuacion: 0, prioridad: 'pendiente' },
      { nombre: 'Educación', puntuacion: 70, prioridad: 'media' },
      { nombre: 'Infraestructura', puntuacion: 40, prioridad: 'alta' },
      { nombre: 'Economía Local', puntuacion: 50, prioridad: 'alta' },
      { nombre: 'Organización Social', puntuacion: 65, prioridad: 'media' }
    ],
    hallazgos: [
      'Sistema educativo funcional pero con limitaciones de recursos',
      'Necesidades importantes en conectividad vial'
    ],
    recomendaciones: [
      'Mejorar acceso vial a la comunidad',
      'Fortalecer programas de desarrollo económico local'
    ]
  },
  {
    id: 3,
    comunidad: 'Comunidad El Progreso',
    region: 'Este',
    fechaInicio: '2024-03-01',
    fechaFinalizacion: '2024-04-15',
    estado: 'planificado',
    progreso: 15,
    responsable: 'Ing. Fernando Castillo',
    equipo: ['Laura Jiménez', 'Pedro Morales'],
    areas: [
      { nombre: 'Salud', puntuacion: 0, prioridad: 'pendiente' },
      { nombre: 'Educación', puntuacion: 0, prioridad: 'pendiente' },
      { nombre: 'Infraestructura', puntuacion: 0, prioridad: 'pendiente' },
      { nombre: 'Economía Local', puntuacion: 0, prioridad: 'pendiente' },
      { nombre: 'Organización Social', puntuacion: 30, prioridad: 'evaluando' }
    ],
    hallazgos: [],
    recomendaciones: []
  }
]

const getEstadoBadge = (estado: string) => {
  const badges = {
    'completado': <Badge className="bg-green-100 text-green-800">Completado</Badge>,
    'en_progreso': <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>,
    'planificado': <Badge className="bg-gray-100 text-gray-800">Planificado</Badge>,
    'suspendido': <Badge className="bg-red-100 text-red-800">Suspendido</Badge>
  }
  return badges[estado as keyof typeof badges] || <Badge>Desconocido</Badge>
}

const getPrioridadBadge = (prioridad: string) => {
  const badges = {
    'crítica': <Badge className="bg-red-100 text-red-800">Crítica</Badge>,
    'alta': <Badge className="bg-orange-100 text-orange-800">Alta</Badge>,
    'media': <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>,
    'baja': <Badge className="bg-green-100 text-green-800">Baja</Badge>,
    'pendiente': <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>,
    'evaluando': <Badge className="bg-blue-100 text-blue-800">Evaluando</Badge>
  }
  return badges[prioridad as keyof typeof badges] || <Badge>-</Badge>
}

const getPrioridadColor = (prioridad: string) => {
  const colors = {
    'crítica': 'bg-red-500',
    'alta': 'bg-orange-500',
    'media': 'bg-yellow-500',
    'baja': 'bg-green-500',
    'pendiente': 'bg-gray-300',
    'evaluando': 'bg-blue-500'
  }
  return colors[prioridad as keyof typeof colors] || 'bg-gray-300'
}

export function PimcoDiagnosticoComunitarioSection() {
  const [selectedTab, setSelectedTab] = useState('diagnosticos')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<typeof diagnosticosPimco[0] | null>(null)

  const [formData, setFormData] = useState({
    comunidad: '',
    region: '',
    fechaInicio: '',
    fechaFinalizacion: '',
    responsable: '',
    equipo: '',
    objetivos: ''
  })

  const resetForm = () => {
    setFormData({
      comunidad: '',
      region: '',
      fechaInicio: '',
      fechaFinalizacion: '',
      responsable: '',
      equipo: '',
      objetivos: ''
    })
  }

  const handleCreate = () => {
    console.log('Crear diagnóstico:', formData)
    setIsCreating(false)
    resetForm()
  }

  const resumenGeneral = {
    totalDiagnosticos: diagnosticosPimco.length,
    completados: diagnosticosPimco.filter(d => d.estado === 'completado').length,
    enProgreso: diagnosticosPimco.filter(d => d.estado === 'en_progreso').length,
    planificados: diagnosticosPimco.filter(d => d.estado === 'planificado').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold">PIMCO - Diagnóstico Comunitario</h2>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Diagnóstico
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle>Iniciar Nuevo Diagnóstico Comunitario</DialogTitle>
              <DialogDescription>
                Configure los parámetros iniciales para el diagnóstico PIMCO
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="comunidad">Comunidad</Label>
                  <Input
                    id="comunidad"
                    value={formData.comunidad}
                    onChange={(e) => setFormData({...formData, comunidad: e.target.value})}
                    placeholder="Nombre de la comunidad"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    placeholder="Región geográfica"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaFinalizacion">Fecha de Finalización</Label>
                  <Input
                    id="fechaFinalizacion"
                    type="date"
                    value={formData.fechaFinalizacion}
                    onChange={(e) => setFormData({...formData, fechaFinalizacion: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="responsable">Responsable Principal</Label>
                <Input
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                  placeholder="Nombre del responsable del diagnóstico"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="equipo">Equipo de Trabajo</Label>
                <Input
                  id="equipo"
                  value={formData.equipo}
                  onChange={(e) => setFormData({...formData, equipo: e.target.value})}
                  placeholder="Nombres separados por comas"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="objetivos">Objetivos Específicos</Label>
                <Textarea
                  id="objetivos"
                  value={formData.objetivos}
                  onChange={(e) => setFormData({...formData, objetivos: e.target.value})}
                  placeholder="Describa los objetivos específicos del diagnóstico"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Iniciar Diagnóstico
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnosticos" className="space-y-4">
          <div className="grid gap-4">
            {diagnosticosPimco.map((diagnostico) => (
              <Card key={diagnostico.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {diagnostico.comunidad}
                        {getEstadoBadge(diagnostico.estado)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Región {diagnostico.region}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {diagnostico.fechaInicio} - {diagnostico.fechaFinalizacion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {diagnostico.responsable}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{diagnostico.progreso}%</div>
                      <div className="text-sm text-muted-foreground">Progreso</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso General</span>
                      <span>{diagnostico.progreso}%</span>
                    </div>
                    <Progress value={diagnostico.progreso} className="h-2" />
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Áreas de Evaluación:</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {diagnostico.areas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{area.nombre}</span>
                          <div className="flex items-center gap-2">
                            {area.puntuacion > 0 ? (
                              <span className="text-sm font-bold">{area.puntuacion}/100</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Pendiente</span>
                            )}
                            {getPrioridadBadge(area.prioridad)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {diagnostico.equipo.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Equipo de Trabajo:</h4>
                      <div className="flex flex-wrap gap-1">
                        {diagnostico.equipo.map((miembro, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {miembro}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedDiagnostico(diagnostico)}>
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    {diagnostico.estado === 'completado' && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Reporte
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          {selectedDiagnostico ? (
            <Card>
              <CardHeader>
                <CardTitle>Resultados - {selectedDiagnostico.comunidad}</CardTitle>
                <CardDescription>
                  Diagnóstico completado el {selectedDiagnostico.fechaFinalizacion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Puntuación por Área:</h4>
                  <div className="space-y-3">
                    {selectedDiagnostico.areas.map((area, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{area.nombre}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{area.puntuacion}/100</span>
                            {getPrioridadBadge(area.prioridad)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={area.puntuacion} className="flex-1 h-3" />
                          <div className={`w-3 h-3 rounded-full ${getPrioridadColor(area.prioridad)}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDiagnostico.hallazgos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Principales Hallazgos:</h4>
                    <ul className="space-y-2">
                      {selectedDiagnostico.hallazgos.map((hallazgo, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{hallazgo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDiagnostico.recomendaciones.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recomendaciones:</h4>
                    <ul className="space-y-2">
                      {selectedDiagnostico.recomendaciones.map((recomendacion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recomendacion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Seleccione un diagnóstico en la pestaña anterior para ver los resultados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparativo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo entre Comunidades</CardTitle>
              <CardDescription>
                Análisis comparativo de las áreas evaluadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Salud', 'Educación', 'Infraestructura', 'Economía Local', 'Organización Social'].map((area) => (
                  <div key={area}>
                    <h4 className="font-medium mb-3">{area}</h4>
                    <div className="space-y-2">
                      {diagnosticosPimco.map((diagnostico) => {
                        const areaData = diagnostico.areas.find(a => a.nombre === area)
                        return (
                          <div key={diagnostico.id} className="flex items-center gap-4">
                            <div className="w-32 text-sm font-medium">{diagnostico.comunidad}</div>
                            <div className="flex-1">
                              <Progress value={areaData?.puntuacion || 0} className="h-2" />
                            </div>
                            <div className="w-16 text-sm text-right">
                              {areaData?.puntuacion || 0}/100
                            </div>
                            <div className="w-20">
                              {areaData && getPrioridadBadge(areaData.prioridad)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Diagnósticos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.totalDiagnosticos}</div>
                <p className="text-xs text-muted-foreground">
                  En todas las regiones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.completados}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((resumenGeneral.completados / resumenGeneral.totalDiagnosticos) * 100)}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.enProgreso}</div>
                <p className="text-xs text-muted-foreground">
                  Activos actualmente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planificados</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.planificados}</div>
                <p className="text-xs text-muted-foreground">
                  Próximos a iniciar
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Prioridades</CardTitle>
              <CardDescription>
                Análisis de áreas críticas identificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['crítica', 'alta', 'media', 'baja'].map((prioridad) => {
                  const count = diagnosticosPimco
                    .flatMap(d => d.areas)
                    .filter(a => a.prioridad === prioridad).length
                  const total = diagnosticosPimco.flatMap(d => d.areas).length
                  const percentage = total > 0 ? (count / total) * 100 : 0
                  
                  return (
                    <div key={prioridad} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{prioridad}</span>
                        <span className="text-sm text-muted-foreground">{count} áreas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-xs w-12 text-right">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

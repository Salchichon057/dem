'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { MapPin, Users, TrendingUp, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const comunidadesPimco = [
  {
    id: 1,
    nombre: 'Comunidad San José',
    region: 'Norte',
    poblacion: 2500,
    familias: 450,
    estado: 'activo',
    progreso: 75,
    proyectos: [
      { nombre: 'Proyecto Agua Potable', estado: 'en_progreso', progreso: 60 },
      { nombre: 'Centro de Salud', estado: 'completado', progreso: 100 },
      { nombre: 'Escuela Primaria', estado: 'planificado', progreso: 0 }
    ],
    coordinador: 'María González',
    ultimaVisita: '2024-01-15'
  },
  {
    id: 2,
    nombre: 'Comunidad Las Flores',
    region: 'Sur',
    poblacion: 1800,
    familias: 320,
    estado: 'activo',
    progreso: 40,
    proyectos: [
      { nombre: 'Electrificación Rural', estado: 'en_progreso', progreso: 30 },
      { nombre: 'Programa de Nutrición', estado: 'en_progreso', progreso: 50 }
    ],
    coordinador: 'Carlos Mendoza',
    ultimaVisita: '2024-01-10'
  },
  {
    id: 3,
    nombre: 'Comunidad El Progreso',
    region: 'Este',
    poblacion: 3200,
    familias: 580,
    estado: 'planificado',
    progreso: 15,
    proyectos: [
      { nombre: 'Evaluación Inicial', estado: 'en_progreso', progreso: 80 },
      { nombre: 'Plan de Desarrollo', estado: 'planificado', progreso: 0 }
    ],
    coordinador: 'Ana Rodríguez',
    ultimaVisita: '2024-01-05'
  }
]

const getEstadoBadge = (estado: string) => {
  const badges = {
    'activo': <Badge className="bg-green-100 text-green-800">Activo</Badge>,
    'planificado': <Badge className="bg-blue-100 text-blue-800">Planificado</Badge>,
    'suspendido': <Badge className="bg-red-100 text-red-800">Suspendido</Badge>
  }
  return badges[estado as keyof typeof badges] || <Badge>Desconocido</Badge>
}

const getProyectoIcon = (estado: string) => {
  const icons = {
    'completado': <CheckCircle className="h-4 w-4 text-green-600" />,
    'en_progreso': <Clock className="h-4 w-4 text-blue-600" />,
    'planificado': <AlertCircle className="h-4 w-4 text-gray-400" />
  }
  return icons[estado as keyof typeof icons] || <Clock className="h-4 w-4" />
}

const resumenGeneral = {
  totalComunidades: 3,
  comunidadesActivas: 2,
  totalFamilias: 1350,
  totalPoblacion: 7500,
  proyectosActivos: 5,
  proyectosCompletados: 1
}

export function PimcoComunidadesSection() {
  const [selectedTab, setSelectedTab] = useState('resumen')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">PIMCO - Comunidades</h2>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen">Resumen General</TabsTrigger>
          <TabsTrigger value="comunidades">Lista de Comunidades</TabsTrigger>
          <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comunidades</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.totalComunidades}</div>
                <p className="text-xs text-muted-foreground">
                  {resumenGeneral.comunidadesActivas} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Familias Beneficiadas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.totalFamilias.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {resumenGeneral.totalPoblacion.toLocaleString()} personas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenGeneral.proyectosActivos}</div>
                <p className="text-xs text-muted-foreground">
                  {resumenGeneral.proyectosCompletados} completados
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progreso General por Comunidad</CardTitle>
              <CardDescription>
                Avance de implementación de proyectos PIMCO por comunidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {comunidadesPimco.map((comunidad) => (
                <div key={comunidad.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{comunidad.nombre}</span>
                    <span className="text-sm text-muted-foreground">{comunidad.progreso}%</span>
                  </div>
                  <Progress value={comunidad.progreso} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunidades" className="space-y-4">
          <div className="grid gap-4">
            {comunidadesPimco.map((comunidad) => (
              <Card key={comunidad.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {comunidad.nombre}
                        {getEstadoBadge(comunidad.estado)}
                      </CardTitle>
                      <CardDescription>
                        Región {comunidad.region} • {comunidad.familias} familias • {comunidad.poblacion.toLocaleString()} habitantes
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{comunidad.progreso}%</div>
                      <div className="text-sm text-muted-foreground">Progreso</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Coordinador: {comunidad.coordinador}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Última visita: {comunidad.ultimaVisita}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Proyectos Activos:</h4>
                    <div className="space-y-2">
                      {comunidad.proyectos.map((proyecto, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {getProyectoIcon(proyecto.estado)}
                            <span className="text-sm font-medium">{proyecto.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={proyecto.progreso} className="w-20 h-2" />
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {proyecto.progreso}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Ver Detalles</Button>
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="outline" size="sm">Historial</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="proyectos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Proyectos PIMCO</CardTitle>
              <CardDescription>
                Lista completa de proyectos en todas las comunidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comunidadesPimco.flatMap((comunidad, comunidadIndex) =>
                  comunidad.proyectos.map((proyecto, proyectoIndex) => (
                    <div key={`${comunidadIndex}-${proyectoIndex}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getProyectoIcon(proyecto.estado)}
                        <div>
                          <div className="font-medium">{proyecto.nombre}</div>
                          <div className="text-sm text-muted-foreground">{comunidad.nombre}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{proyecto.progreso}%</div>
                          <Progress value={proyecto.progreso} className="w-20 h-2" />
                        </div>
                        <Button variant="outline" size="sm">Ver</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

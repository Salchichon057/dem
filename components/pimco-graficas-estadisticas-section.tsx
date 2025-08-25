'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, PieChart, LineChart, Users, MapPin, Activity } from 'lucide-react'

const estadisticasPimco = {
  indicadoresGenerales: {
    comunidadesImpactadas: 3,
    familiasAtendidas: 1350,
    proyectosEjecutados: 6,
    inversion: 250000,
    progresoGeneral: 65
  },
  impactoPorRegion: [
    { region: 'Norte', comunidades: 1, familias: 450, inversion: 120000, progreso: 75 },
    { region: 'Sur', comunidades: 1, familias: 320, inversion: 80000, progreso: 40 },
    { region: 'Este', comunidades: 1, familias: 580, inversion: 50000, progreso: 15 }
  ],
  tiposProyecto: [
    { tipo: 'Infraestructura', cantidad: 3, presupuesto: 150000, completados: 1 },
    { tipo: 'Salud', cantidad: 2, presupuesto: 60000, completados: 1 },
    { tipo: 'Educación', cantidad: 1, presupuesto: 40000, completados: 0 }
  ],
  evolucionMensual: [
    { mes: 'Ene', familias: 100, proyectos: 1, inversion: 25000 },
    { mes: 'Feb', familias: 280, proyectos: 2, inversion: 55000 },
    { mes: 'Mar', familias: 450, proyectos: 3, inversion: 95000 },
    { mes: 'Abr', familias: 650, proyectos: 4, inversion: 140000 },
    { mes: 'May', familias: 890, proyectos: 5, inversion: 190000 },
    { mes: 'Jun', familias: 1350, proyectos: 6, inversion: 250000 }
  ]
}

export function PimcoGraficasEstadisticasSection() {
  const [selectedTab, setSelectedTab] = useState('indicadores')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">PIMCO - Gráficas y Estadísticas</h2>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="regiones">Por Región</TabsTrigger>
          <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="indicadores" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comunidades</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticasPimco.indicadoresGenerales.comunidadesImpactadas}</div>
                <p className="text-xs text-muted-foreground">
                  En 3 regiones diferentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Familias Atendidas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticasPimco.indicadoresGenerales.familiasAtendidas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +85% vs año anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticasPimco.indicadoresGenerales.proyectosEjecutados}</div>
                <p className="text-xs text-muted-foreground">
                  2 completados, 4 en progreso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${estadisticasPimco.indicadoresGenerales.inversion.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  USD en 6 meses
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progreso General del Programa PIMCO</CardTitle>
              <CardDescription>
                Avance consolidado de todas las iniciativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Progreso Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {estadisticasPimco.indicadoresGenerales.progresoGeneral}%
                  </span>
                </div>
                <Progress value={estadisticasPimco.indicadoresGenerales.progresoGeneral} className="h-4" />
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Meta 2024:</span> 80%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Promedio mensual:</span> +12%
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tiempo restante:</span> 6 meses
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regiones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impacto por Región</CardTitle>
              <CardDescription>
                Distribución de recursos y progreso por área geográfica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estadisticasPimco.impactoPorRegion.map((region, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">Región {region.region}</h4>
                        <p className="text-sm text-muted-foreground">
                          {region.comunidades} comunidad • {region.familias} familias
                        </p>
                      </div>
                      <Badge variant={region.progreso > 60 ? 'default' : region.progreso > 30 ? 'secondary' : 'outline'}>
                        {region.progreso}%
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-3 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-600">{region.familias}</div>
                        <div className="text-xs text-blue-800">Familias</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xl font-bold text-green-600">${region.inversion.toLocaleString()}</div>
                        <div className="text-xs text-green-800">Inversión</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-xl font-bold text-purple-600">{region.progreso}%</div>
                        <div className="text-xs text-purple-800">Progreso</div>
                      </div>
                    </div>
                    
                    <Progress value={region.progreso} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proyectos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Tipo de Proyecto</CardTitle>
              <CardDescription>
                Análisis de inversión y resultados por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estadisticasPimco.tiposProyecto.map((tipo, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{tipo.tipo}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{tipo.cantidad} proyectos</Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {tipo.completados} completados
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Proyectos</div>
                        <div className="text-xl font-bold">{tipo.cantidad}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Completados</div>
                        <div className="text-xl font-bold text-green-600">{tipo.completados}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">En Progreso</div>
                        <div className="text-xl font-bold text-blue-600">{tipo.cantidad - tipo.completados}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Presupuesto</div>
                        <div className="text-xl font-bold">${tipo.presupuesto.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tasa de Finalización</span>
                        <span>{Math.round((tipo.completados / tipo.cantidad) * 100)}%</span>
                      </div>
                      <Progress value={(tipo.completados / tipo.cantidad) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución del Programa PIMCO</CardTitle>
              <CardDescription>
                Tendencias mensuales de crecimiento e impacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {estadisticasPimco.evolucionMensual.map((mes, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-blue-600 w-12">{mes.mes}</div>
                      <div className="grid gap-1 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{mes.familias} familias</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{mes.proyectos} proyectos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">${mes.inversion.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {index > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          +{mes.familias - estadisticasPimco.evolucionMensual[index-1].familias} familias
                        </div>
                        <div className="text-xs text-muted-foreground">
                          vs mes anterior
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Crecimiento Acumulado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Familias Atendidas</span>
                      <span>1,350</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Inversión Total</span>
                      <span>$250,000</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Proyectos Activos</span>
                      <span>6</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Proyección 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2,000</div>
                    <div className="text-sm text-muted-foreground">Familias Meta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$400,000</div>
                    <div className="text-sm text-muted-foreground">Inversión Planificada</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">10</div>
                    <div className="text-sm text-muted-foreground">Proyectos Totales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

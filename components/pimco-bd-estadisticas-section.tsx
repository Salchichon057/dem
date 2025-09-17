'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Database, Download, Filter, Calendar, MapPin, Users, BarChart3 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface EntrevistaPimco {
  id: string
  marcaTemporal: string
  fechaEncuesta: string
  estadoVisita: string
  nombreComunidad: string
  departamento: string
  municipio: string
  encargadoVisita: string
  sexoEntrevistado: string
  fechaNacimiento: string | null
  dpi: string | null
  edad: number | null
  etnia: string | null
  escolaridad: string | null
  tipoVivienda: string | null
  personasHogar: number | null
  ingresoMensual: string | null
  personaEmbarazada: boolean | null
  mesesEmbarazo: string | null
  personaDiscapacidad: boolean | null
  observacionesDiscapacidad: string | null
  convulsiones: string | null
  fuenteAgua: string | null
  frecuenciaAgua: string | null
  duracionAgua: string | null
  distanciaAgua: string | null
  tiempoAgua: string | null
  tratamientoAgua: string | null
  tipoSanitario: string | null
  eliminaAguasNegras: boolean | null
  formaEliminacion: string | null
  energiaElectrica: boolean | null
  materialParedes: string | null
  materialTecho: string | null
  materialPiso: string | null
  materialPatio: string | null
  espaciosVivienda: string | null
  cocinaSeparada: boolean | null
  observacionesCocina: string | null
  habitosHigiene: string | null
  frecuenciaHigiene: string | null
  ocupacionJefeHogar: string | null
  fuenteIngresoFamilia: string | null
  personasTrabajan: number | null
  familiarExtranjero: boolean | null
  recibeRemesas: boolean | null
  frecuenciaRemesas: string | null
  usoRemesas: string | null
  tieneTierra: boolean | null
  alquilaTierra: boolean | null
  cultivaTierra: string | null
  usoCosecha: string | null
  guardaAlimentos: boolean | null
  alimentosGuardados: string | null
  cantidadAlmacena: string | null
  tiempoDura: string | null
  huertoFamiliar: boolean | null
  cosechaHuerto: string | null
  controlPlagas: boolean | null
  metodosControl: string | null
  sistemaRiego: boolean | null
  tipoRiego: string | null
  fuenteAguaRiego: string | null
  accesoSalud: boolean | null
  enfermerosPermanentes: boolean | null
  tiempoSalud: string | null
  ninesMenores5: number | null
  controlVacunacion: boolean | null
  enfermanDiarrea: boolean | null
  frecuenciaDiarrea: string | null
  acudeSaludDiarrea: boolean | null
  enfermanRespiratorias: boolean | null
  frecuenciaRespiratorias: string | null
  acudeSaludRespiratorias: boolean | null
  escalaHambre1: string | null
  escalaHambre2: string | null
  escalaHambre3: string | null
  tiemposComida: string | null
  consumoVerduras: Record<string, unknown> | null
  consumoFrutas: Record<string, unknown> | null
  consumoAzucares: Record<string, unknown> | null
  consumoCereales: Record<string, unknown> | null
  consumoCarnes: Record<string, unknown> | null
  consumoLacteos: Record<string, unknown> | null
  consumoGrasas: Record<string, unknown> | null
  temasCapacitacion: string | null
  nombreEncargado: string | null
  precioVenta: string | null
}

interface FiltroItem {
  municipio: string
  departamento: string
}

interface ResponseData {
  entrevistas: EntrevistaPimco[]
  pagination: {
    currentPage: number
    totalPages: number
    totalRegistros: number
    limit: number
  }
  filtros: {
    departamentos: string[]
    municipios: FiltroItem[]
  }
}

interface EstadisticasResumen {
  totalEntrevistas: number
  distribucionSexo: { [key: string]: number }
  distribucionEtnia: { [key: string]: number }
  promedioEdad: number
  distribucionEscolaridad: { [key: string]: number }
  distribucionIngresos: { [key: string]: number }
}

export function PimcoBdEstadisticasSection() {
  const [activeTab, setActiveTab] = useState('tabla')
  const [entrevistas, setEntrevistas] = useState<EntrevistaPimco[]>([])
  const [estadisticasResumen, setEstadisticasResumen] = useState<EstadisticasResumen>({
    totalEntrevistas: 0,
    distribucionSexo: {},
    distribucionEtnia: {},
    promedioEdad: 0,
    distribucionEscolaridad: {},
    distribucionIngresos: {}
  })
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    departamento: 'all',
    municipio: 'all',
    busqueda: ''
  })
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRegistros: 0,
    limit: 50
  })
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [municipios, setMunicipios] = useState<FiltroItem[]>([])

  // Cargar datos desde la API
  const cargarDatos = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: paginacion.limit.toString(),
      })
      
      if (filtros.departamento !== 'all') {
        params.append('departamento', filtros.departamento)
      }
      
      if (filtros.municipio !== 'all') {
        params.append('municipio', filtros.municipio)
      }

      const response = await fetch(`/api/pimco-bd-estadisticas?${params}`)
      if (!response.ok) {
        throw new Error('Error al cargar datos')
      }

      const data: ResponseData = await response.json()
      
      setEntrevistas(data.entrevistas)
      setPaginacion(data.pagination)
      setDepartamentos(data.filtros.departamentos)
      setMunicipios(data.filtros.municipios)
      
      // Calcular estadísticas de resumen
      calcularEstadisticas(data.entrevistas)
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }, [filtros.departamento, filtros.municipio, paginacion.limit])

  const calcularEstadisticas = (data: EntrevistaPimco[]) => {
    const stats: EstadisticasResumen = {
      totalEntrevistas: data.length,
      distribucionSexo: {},
      distribucionEtnia: {},
      promedioEdad: 0,
      distribucionEscolaridad: {},
      distribucionIngresos: {}
    }

    let totalEdad = 0
    let contadorEdad = 0

    data.forEach(entrevista => {
      // Distribución por sexo
      if (entrevista.sexoEntrevistado) {
        stats.distribucionSexo[entrevista.sexoEntrevistado] = 
          (stats.distribucionSexo[entrevista.sexoEntrevistado] || 0) + 1
      }

      // Distribución por etnia
      if (entrevista.etnia) {
        stats.distribucionEtnia[entrevista.etnia] = 
          (stats.distribucionEtnia[entrevista.etnia] || 0) + 1
      }

      // Promedio de edad
      if (entrevista.edad) {
        totalEdad += entrevista.edad
        contadorEdad++
      }

      // Distribución por escolaridad
      if (entrevista.escolaridad) {
        stats.distribucionEscolaridad[entrevista.escolaridad] = 
          (stats.distribucionEscolaridad[entrevista.escolaridad] || 0) + 1
      }

      // Distribución por ingresos
      if (entrevista.ingresoMensual) {
        stats.distribucionIngresos[entrevista.ingresoMensual] = 
          (stats.distribucionIngresos[entrevista.ingresoMensual] || 0) + 1
      }
    })

    stats.promedioEdad = contadorEdad > 0 ? Math.round(totalEdad / contadorEdad) : 0

    setEstadisticasResumen(stats)
  }

  // Filtrar municipios por departamento seleccionado
  const municipiosFiltrados = municipios.filter(m => 
    filtros.departamento === 'all' || m.departamento === filtros.departamento
  )

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    cargarDatos(1)
  }

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      departamento: 'all',
      municipio: 'all',
      busqueda: ''
    })
  }

  // Función para exportar datos
  const exportarDatos = () => {
    // Aquí implementarías la exportación a CSV/Excel
    console.log('Exportar datos')
  }

  useEffect(() => {
    const cargarDatosInicial = async () => {
      await cargarDatos()
    }
    cargarDatosInicial()
  }, [cargarDatos])

  // Renderizar estadísticas de resumen
  const renderEstadisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entrevistas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paginacion.totalRegistros}</div>
          <p className="text-xs text-muted-foreground">
            {estadisticasResumen.totalEntrevistas} en página actual
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distribución por Sexo</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(estadisticasResumen.distribucionSexo).map(([sexo, cantidad]) => (
              <div key={sexo} className="flex justify-between text-sm">
                <span>{sexo}:</span>
                <span className="font-medium">{cantidad}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio Edad</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticasResumen.promedioEdad}</div>
          <p className="text-xs text-muted-foreground">años</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distribución Étnica</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(estadisticasResumen.distribucionEtnia).slice(0, 3).map(([etnia, cantidad]) => (
              <div key={etnia} className="flex justify-between text-sm">
                <span>{etnia}:</span>
                <span className="font-medium">{cantidad}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">BD Estadísticas PIMCO</h2>
          <p className="text-muted-foreground">
            Base de datos completa de encuestas y estadísticas comunitarias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportarDatos}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Departamento</label>
              <Select 
                value={filtros.departamento} 
                onValueChange={(value) => setFiltros(prev => ({ ...prev, departamento: value, municipio: 'all' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departamentos.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Municipio</label>
              <Select 
                value={filtros.municipio} 
                onValueChange={(value) => setFiltros(prev => ({ ...prev, municipio: value }))}
                disabled={filtros.departamento === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar municipio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los municipios</SelectItem>
                  {municipiosFiltrados.map(mun => (
                    <SelectItem key={mun.municipio} value={mun.municipio}>
                      {mun.municipio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Búsqueda</label>
              <Input
                placeholder="Buscar en registros..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={aplicarFiltros} className="flex-1">
                Aplicar
              </Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tabla">
            <Database className="mr-2 h-4 w-4" />
            Tabla de Datos
          </TabsTrigger>
          <TabsTrigger value="graficos">
            <BarChart3 className="mr-2 h-4 w-4" />
            Gráficos Resumen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tabla" className="space-y-4">
          {renderEstadisticas()}
          
          <Card>
            <CardHeader>
              <CardTitle>Entrevistas Registradas</CardTitle>
              <CardDescription>
                Página {paginacion.currentPage} de {paginacion.totalPages} 
                ({paginacion.totalRegistros} registros totales)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Cargando datos...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Comunidad</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Municipio</TableHead>
                          <TableHead>Estado Visita</TableHead>
                          <TableHead>Encargado</TableHead>
                          <TableHead>Sexo</TableHead>
                          <TableHead>Edad</TableHead>
                          <TableHead>Etnia</TableHead>
                          <TableHead>Escolaridad</TableHead>
                          <TableHead>Ocupación</TableHead>
                          <TableHead>Ingresos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entrevistas.map(entrevista => (
                          <TableRow key={entrevista.id}>
                            <TableCell>
                              {new Date(entrevista.fechaEncuesta).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {entrevista.nombreComunidad}
                            </TableCell>
                            <TableCell>{entrevista.departamento}</TableCell>
                            <TableCell>{entrevista.municipio}</TableCell>
                            <TableCell>
                              <Badge variant={entrevista.estadoVisita === 'Primera Visita' ? 'default' : 'secondary'}>
                                {entrevista.estadoVisita}
                              </Badge>
                            </TableCell>
                            <TableCell>{entrevista.encargadoVisita}</TableCell>
                            <TableCell>{entrevista.sexoEntrevistado}</TableCell>
                            <TableCell>{entrevista.edad}</TableCell>
                            <TableCell>{entrevista.etnia}</TableCell>
                            <TableCell>{entrevista.escolaridad}</TableCell>
                            <TableCell>{entrevista.ocupacionJefeHogar}</TableCell>
                            <TableCell>{entrevista.ingresoMensual}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((paginacion.currentPage - 1) * paginacion.limit) + 1} al{' '}
                  {Math.min(paginacion.currentPage * paginacion.limit, paginacion.totalRegistros)} de{' '}
                  {paginacion.totalRegistros} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginacion.currentPage <= 1}
                    onClick={() => cargarDatos(paginacion.currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paginacion.currentPage >= paginacion.totalPages}
                    onClick={() => cargarDatos(paginacion.currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          {renderEstadisticas()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Escolaridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(estadisticasResumen.distribucionEscolaridad).map(([escolaridad, cantidad]) => (
                    <div key={escolaridad} className="flex justify-between items-center">
                      <span className="text-sm">{escolaridad}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(cantidad / estadisticasResumen.totalEntrevistas) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(estadisticasResumen.distribucionIngresos).map(([ingreso, cantidad]) => (
                    <div key={ingreso} className="flex justify-between items-center">
                      <span className="text-sm">{ingreso}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(cantidad / estadisticasResumen.totalEntrevistas) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
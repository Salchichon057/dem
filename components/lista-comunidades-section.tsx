'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { List, Database, Download, Filter, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

type EstadoComunidad = 'ACTIVA' | 'SUSPENDIDA' | 'INACTIVA'

interface ComunidadPimco {
  id: string
  fechaInscripcion: string
  departamento: string
  municipio: string
  aldeas: string
  caseriosQueAtienden: string
  qtyCaseriosQueAtienden: number
  ubicacionGoogleMaps: string | null
  liderNumero: string
  asistenteLideresDEM: string | null
  comiteComunitario: string
  activa: boolean
  estado: EstadoComunidad
  cantidadFamiliasEnComunidad: number
  cantidadFamEnRA: number
  primeraInfancia0a2Mujeres: number
  primeraInfancia0a2Hombres: number
  ninez3a5Mujeres: number
  ninez3a5Hombres: number
  jovenes6a10Mujeres: number
  jovenes6a10Hombres: number
  adolescentes11a18Mujeres: number
  adolescentes11a18Hombres: number
  adultos19a60Mujeres: number
  adultos19a60Hombres: number
  adultosMayor61Mujeres: number
  adultosMayor61Hombres: number
  mujeresGestantes: number
  mujeresLactantes: number
  clasificacion: string | null
  capacidadAlmacenamiento: string | null
  formasColocacionInteres: string | null
  fotografiaReferencia: string | null
  tipoColocacion: string | null
  grupoWhatsapp: string | null
  book: string | null
  bolsasMaximo: number | null
  bolsasCortesia: number | null
  fechaBaja: string | null
  motivoSuspencionOBaja: string | null
  createdAt: string
  updatedAt: string
}

export default function ListaComunidadesSection() {
  const [vista, setVista] = useState<'lista' | 'base-datos'>('lista')
  const [comunidades, setComunidades] = useState<ComunidadPimco[]>([])
  const [loading, setLoading] = useState(true)
  const [detalleAbierto, setDetalleAbierto] = useState<string | null>(null)
  
  // Filtros para lista
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos')
  const [filtroAldea, setFiltroAldea] = useState('')
  
  // Filtros para base de datos
  const [filtroMes, setFiltroMes] = useState('todos')
  const [filtroAnio, setFiltroAnio] = useState('todos')
  const [filtroDepartamentoBD, setFiltroDepartamentoBD] = useState('todos')
  const [busquedaTexto, setBusquedaTexto] = useState('')

  useEffect(() => {
    cargarComunidades()
  }, [])

  const cargarComunidades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/comunidades-pimco')
      if (!response.ok) throw new Error('Error al cargar comunidades')
      const data = await response.json()
      setComunidades(data.comunidades || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar las comunidades')
    } finally {
      setLoading(false)
    }
  }

  // Filtrado para lista de comunidades
  const comunidadesFiltradas = comunidades.filter(c => {
    const cumpleDepartamento = filtroDepartamento === 'todos' || c.departamento === filtroDepartamento
    const cumpleAldea = filtroAldea === '' || 
      c.aldeas.toLowerCase().includes(filtroAldea.toLowerCase())
    
    return cumpleDepartamento && cumpleAldea
  })

  // Filtrado para base de datos
  const comunidadesFiltradasBD = comunidades.filter(c => {
    const fecha = new Date(c.fechaInscripcion)
    const mes = (fecha.getMonth() + 1).toString()
    const anio = fecha.getFullYear().toString()

    const cumpleMes = filtroMes === 'todos' || mes === filtroMes
    const cumpleAnio = filtroAnio === 'todos' || anio === filtroAnio
    const cumpleDepartamento = filtroDepartamentoBD === 'todos' || c.departamento === filtroDepartamentoBD
    const cumpleBusqueda = busquedaTexto === '' || 
      c.aldeas.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
      c.municipio.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
      c.liderNumero.toLowerCase().includes(busquedaTexto.toLowerCase())
    
    return cumpleMes && cumpleAnio && cumpleDepartamento && cumpleBusqueda
  })

  const exportarExcelLista = () => {
    const datos = comunidadesFiltradas.map(c => ({
      'Departamento': c.departamento,
      'Municipio': c.municipio,
      'Aldeas': c.aldeas,
      'Lider / Numero': c.liderNumero,
      'Comité Comunitario': c.comiteComunitario,
    }))

    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Comunidades')
    XLSX.writeFile(wb, `lista_comunidades_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Archivo Excel descargado exitosamente')
  }

  const exportarExcelCompleto = () => {
    const datos = comunidadesFiltradasBD.map(c => ({
      'Fecha de inscripción': new Date(c.fechaInscripcion).toLocaleDateString('es-GT'),
      'Departamento': c.departamento,
      'Municipio': c.municipio,
      'Aldeas': c.aldeas,
      'Caserios que atienden': c.caseriosQueAtienden,
      'QTY caserios que atienden': c.qtyCaseriosQueAtienden,
      'Ubicación Google Maps': c.ubicacionGoogleMaps || '',
      'Lider / Numero': c.liderNumero,
      'Asistente en grupo de Lideres/liderezas DEM': c.asistenteLideresDEM || '',
      'Comité Comunitario': c.comiteComunitario,
      'Activa/inactiva': c.estado,
      'Cantidad de familias en comunidad': c.cantidadFamiliasEnComunidad,
      'Cantidad de fam en RA': c.cantidadFamEnRA,
      'Primera infancia (0 a 2 años) Mujeres': c.primeraInfancia0a2Mujeres,
      'Primera infancia (0 a 2 años) Hombres': c.primeraInfancia0a2Hombres,
      'Niñez 3 a 5 años Mujeres': c.ninez3a5Mujeres,
      'Niñez 3 a 5 años Hombres': c.ninez3a5Hombres,
      'Jovenes de 6 a 10 años Mujeres': c.jovenes6a10Mujeres,
      'Jovenes de 6 a 10 años Hombres': c.jovenes6a10Hombres,
      'Adultos 11 a 18 años Mujeres': c.adolescentes11a18Mujeres,
      'Adultos 11 a 18 años Hombres': c.adolescentes11a18Hombres,
      'Adultos 19 a 60 años Mujeres': c.adultos19a60Mujeres,
      'Adultos 19 a 60 años Hombres': c.adultos19a60Hombres,
      'Adulto mayor 61 para arriba Mujeres': c.adultosMayor61Mujeres,
      'Adulto mayor 61 para arriba Hombres': c.adultosMayor61Hombres,
      'Mujeres gestantes': c.mujeresGestantes,
      'Mujeres lactantes': c.mujeresLactantes,
      'Clasificación': c.clasificacion || '',
      'Capacidad de almacenamiento o entrega a beneficiarios': c.capacidadAlmacenamiento || '',
      'Formas de colocación de interes': c.formasColocacionInteres || '',
      'Fotografía del referencia del lugar': c.fotografiaReferencia || '',
      'Tipo de colocación': c.tipoColocacion || '',
      'Grupo de Whatsapp': c.grupoWhatsapp || '',
      'Book': c.book || '',
      'Bolsas Maximo': c.bolsasMaximo || 0,
      'Bolsas de cortesia': c.bolsasCortesia || 0,
      'Fecha de baja': c.fechaBaja ? new Date(c.fechaBaja).toLocaleDateString('es-GT') : '',
      'Motivo de suspención o de Baja': c.motivoSuspencionOBaja || ''
    }))

    const ws = XLSX.utils.json_to_sheet(datos)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Base de Datos')
    XLSX.writeFile(wb, `base_datos_comunidades_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Archivo Excel descargado exitosamente')
  }

  const aniosDisponibles = Array.from(
    new Set(comunidades.map(c => new Date(c.fechaInscripcion).getFullYear()))
  ).sort((a, b) => b - a)

  const departamentosUnicos = Array.from(
    new Set(comunidades.map(c => c.departamento))
  ).sort()

  const meses = [
    { valor: '1', nombre: 'Enero' },
    { valor: '2', nombre: 'Febrero' },
    { valor: '3', nombre: 'Marzo' },
    { valor: '4', nombre: 'Abril' },
    { valor: '5', nombre: 'Mayo' },
    { valor: '6', nombre: 'Junio' },
    { valor: '7', nombre: 'Julio' },
    { valor: '8', nombre: 'Agosto' },
    { valor: '9', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cargando comunidades...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Lista de Comunidades
          </h2>
          <p className="text-muted-foreground">
            Gestiona y visualiza las comunidades del programa
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Button
              variant={vista === 'lista' ? 'default' : 'outline'}
              onClick={() => setVista('lista')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Lista de Comunidades
            </Button>
            <Button
              variant={vista === 'base-datos' ? 'default' : 'outline'}
              onClick={() => setVista('base-datos')}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Base de Datos Comunidades
            </Button>
          </div>
        </CardContent>
      </Card>

      {vista === 'lista' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filtroDept">Departamento</Label>
                  <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {departamentosUnicos.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filtroAldea">Buscar Aldea</Label>
                  <Input
                    id="filtroAldea"
                    placeholder="Nombre de aldea..."
                    value={filtroAldea}
                    onChange={(e) => setFiltroAldea(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={exportarExcelLista}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Comunidades ({comunidadesFiltradas.length} registros)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Aldeas</TableHead>
                      <TableHead>Lider / Numero</TableHead>
                      <TableHead>Comité Comunitario</TableHead>
                      <TableHead>Opciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comunidadesFiltradas.map((c) => (
                      <>
                        <TableRow key={c.id}>
                          <TableCell>{c.departamento}</TableCell>
                          <TableCell>{c.municipio}</TableCell>
                          <TableCell>{c.aldeas}</TableCell>
                          <TableCell>{c.liderNumero}</TableCell>
                          <TableCell className="max-w-xs truncate">{c.comiteComunitario}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetalleAbierto(detalleAbierto === c.id ? null : c.id)}
                            >
                              {detalleAbierto === c.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span className="ml-2">Detalle</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                        {detalleAbierto === c.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-gray-50">
                              <div className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">Información Detallada</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-700">Información General</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium">Fecha de inscripción:</span>
                                        <p className="text-gray-600">{new Date(c.fechaInscripcion).toLocaleDateString('es-GT')}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Departamento:</span>
                                        <p className="text-gray-600">{c.departamento}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Municipio:</span>
                                        <p className="text-gray-600">{c.municipio}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Aldeas:</span>
                                        <p className="text-gray-600">{c.aldeas}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Caserios que atienden:</span>
                                        <p className="text-gray-600">{c.caseriosQueAtienden}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">QTY caserios que atienden:</span>
                                        <p className="text-gray-600">{c.qtyCaseriosQueAtienden}</p>
                                      </div>
                                      {c.ubicacionGoogleMaps && (
                                        <div>
                                          <span className="font-medium">Ubicación Google Maps:</span>
                                          <a 
                                            href={c.ubicacionGoogleMaps} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline block"
                                          >
                                            Ver en Google Maps
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-700">Liderazgo y Comité</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium">Lider / Numero:</span>
                                        <p className="text-gray-600">{c.liderNumero}</p>
                                      </div>
                                      {c.asistenteLideresDEM && (
                                        <div>
                                          <span className="font-medium">Asistente en grupo de Lideres/liderezas DEM:</span>
                                          <p className="text-gray-600">{c.asistenteLideresDEM}</p>
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-medium">Comité Comunitario:</span>
                                        <p className="text-gray-600">{c.comiteComunitario}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Activa/inactiva:</span>
                                        <Badge className={
                                          c.estado === 'ACTIVA' 
                                            ? 'bg-green-100 text-green-800' 
                                            : c.estado === 'SUSPENDIDA'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }>
                                          {c.estado}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-700">Familias</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium">Cantidad de familias en comunidad:</span>
                                        <p className="text-gray-600">{c.cantidadFamiliasEnComunidad}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Cantidad de fam en RA:</span>
                                        <p className="text-gray-600">{c.cantidadFamEnRA}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Distribución Poblacional</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Primera infancia (0 a 2 años)</p>
                                      <p className="text-gray-800">Mujeres: <span className="font-semibold">{c.primeraInfancia0a2Mujeres}</span></p>
                                      <p className="text-gray-800">Hombres: <span className="font-semibold">{c.primeraInfancia0a2Hombres}</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Niñez 3 a 5 años</p>
                                      <p className="text-gray-800">Mujeres: <span className="font-semibold">{c.ninez3a5Mujeres}</span></p>
                                      <p className="text-gray-800">Hombres: <span className="font-semibold">{c.ninez3a5Hombres}</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Jovenes de 6 a 10 años</p>
                                      <p className="text-gray-800">Mujeres: <span className="font-semibold">{c.jovenes6a10Mujeres}</span></p>
                                      <p className="text-gray-800">Hombres: <span className="font-semibold">{c.jovenes6a10Hombres}</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Adultos 11 a 18 años</p>
                                      <p className="text-gray-800">Mujeres: <span className="font-semibold">{c.adolescentes11a18Mujeres}</span></p>
                                      <p className="text-gray-800">Hombres: <span className="font-semibold">{c.adolescentes11a18Hombres}</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Adultos 19 a 60 años</p>
                                      <p className="text-gray-800">Mujeres: <span className="font-semibold">{c.adultos19a60Mujeres}</span></p>
                                      <p className="text-gray-800">Hombres: <span className="font-semibold">{c.adultos19a60Hombres}</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Adulto mayor 61 para arriba</p>
                                      <p className="text-gray-800">Mujeres: <span className="font-semibold">{c.adultosMayor61Mujeres}</span></p>
                                      <p className="text-gray-800">Hombres: <span className="font-semibold">{c.adultosMayor61Hombres}</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded border">
                                      <p className="font-medium text-xs text-gray-600 mb-1">Mujeres</p>
                                      <p className="text-gray-800">Gestantes: <span className="font-semibold">{c.mujeresGestantes}</span></p>
                                      <p className="text-gray-800">Lactantes: <span className="font-semibold">{c.mujeresLactantes}</span></p>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Información Operativa</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {c.clasificacion && (
                                      <div>
                                        <span className="font-medium">Clasificación:</span>
                                        <p className="text-gray-600">{c.clasificacion}</p>
                                        <p className="text-xs text-gray-500">Pequeña: 1-50, Mediana: 51-150, Grande: arriba 150</p>
                                      </div>
                                    )}
                                    {c.capacidadAlmacenamiento && (
                                      <div>
                                        <span className="font-medium">Capacidad de almacenamiento o entrega a beneficiarios:</span>
                                        <p className="text-gray-600">{c.capacidadAlmacenamiento}</p>
                                      </div>
                                    )}
                                    {c.formasColocacionInteres && (
                                      <div>
                                        <span className="font-medium">Formas de colocación de interés:</span>
                                        <p className="text-gray-600">{c.formasColocacionInteres}</p>
                                        <p className="text-xs text-gray-500">BS: bazar seco, BA: bazar agrícola, C: combos, B: bolsas</p>
                                      </div>
                                    )}
                                    {c.fotografiaReferencia && (
                                      <div>
                                        <span className="font-medium">Fotografía del referencia del lugar:</span>
                                        <p className="text-gray-600">{c.fotografiaReferencia}</p>
                                      </div>
                                    )}
                                    {c.tipoColocacion && (
                                      <div>
                                        <span className="font-medium">Tipo de colocación:</span>
                                        <p className="text-gray-600">{c.tipoColocacion}</p>
                                      </div>
                                    )}
                                    {c.grupoWhatsapp && (
                                      <div>
                                        <span className="font-medium">Grupo de Whatsapp:</span>
                                        <p className="text-gray-600">{c.grupoWhatsapp}</p>
                                      </div>
                                    )}
                                    {c.book && (
                                      <div>
                                        <span className="font-medium">Book:</span>
                                        <p className="text-gray-600">{c.book}</p>
                                      </div>
                                    )}
                                    {c.bolsasMaximo !== null && (
                                      <div>
                                        <span className="font-medium">Bolsas Máximo:</span>
                                        <p className="text-gray-600">{c.bolsasMaximo}</p>
                                      </div>
                                    )}
                                    {c.bolsasCortesia !== null && (
                                      <div>
                                        <span className="font-medium">Bolsas de cortesía:</span>
                                        <p className="text-gray-600">{c.bolsasCortesia}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {(c.fechaBaja || c.motivoSuspencionOBaja) && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold text-sm mb-3 text-red-600">Información de Baja/Suspensión</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      {c.fechaBaja && (
                                        <div>
                                          <span className="font-medium">Fecha de baja:</span>
                                          <p className="text-gray-600">{new Date(c.fechaBaja).toLocaleDateString('es-GT')}</p>
                                        </div>
                                      )}
                                      {c.motivoSuspencionOBaja && (
                                        <div>
                                          <span className="font-medium">Motivo de suspención o de Baja:</span>
                                          <p className="text-gray-600">{c.motivoSuspencionOBaja}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {vista === 'base-datos' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avanzados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filtroMes">Mes</Label>
                  <Select value={filtroMes} onValueChange={setFiltroMes}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Todos los meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {meses.map(m => (
                        <SelectItem key={m.valor} value={m.valor}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filtroAnio">Año</Label>
                  <Select value={filtroAnio} onValueChange={setFiltroAnio}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Todos los años" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {aniosDisponibles.map(a => (
                        <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filtroDeptBD">Departamento</Label>
                  <Select value={filtroDepartamentoBD} onValueChange={setFiltroDepartamentoBD}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Sacatepéquez">Sacatepéquez</SelectItem>
                      <SelectItem value="Chimaltenango">Chimaltenango</SelectItem>
                      <SelectItem value="Escuintla">Escuintla</SelectItem>
                      <SelectItem value="Santa Rosa">Santa Rosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="busquedaTextoBD">Buscar</Label>
                  <Input
                    id="busquedaTextoBD"
                    placeholder="Aldea, municipio, líder..."
                    value={busquedaTexto}
                    onChange={(e) => setBusquedaTexto(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={exportarExcelCompleto}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Base de Datos Completa ({comunidadesFiltradasBD.length} registros)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha de inscripción</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Aldeas</TableHead>
                      <TableHead>Caserios que atienden</TableHead>
                      <TableHead>QTY caserios</TableHead>
                      <TableHead>Ubicación Google Maps</TableHead>
                      <TableHead>Líder / Número</TableHead>
                      <TableHead>Asistente Líderes DEM</TableHead>
                      <TableHead>Comité Comunitario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Familias comunidad</TableHead>
                      <TableHead>Familias RA</TableHead>
                      <TableHead>0-2 M</TableHead>
                      <TableHead>0-2 H</TableHead>
                      <TableHead>3-5 M</TableHead>
                      <TableHead>3-5 H</TableHead>
                      <TableHead>6-10 M</TableHead>
                      <TableHead>6-10 H</TableHead>
                      <TableHead>11-18 M</TableHead>
                      <TableHead>11-18 H</TableHead>
                      <TableHead>19-60 M</TableHead>
                      <TableHead>19-60 H</TableHead>
                      <TableHead>61+ M</TableHead>
                      <TableHead>61+ H</TableHead>
                      <TableHead>Gestantes</TableHead>
                      <TableHead>Lactantes</TableHead>
                      <TableHead>Clasificación</TableHead>
                      <TableHead>Capacidad almacenamiento</TableHead>
                      <TableHead>Formas colocación</TableHead>
                      <TableHead>Fotografía</TableHead>
                      <TableHead>Tipo colocación</TableHead>
                      <TableHead>Grupo Whatsapp</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Bolsas Máximo</TableHead>
                      <TableHead>Bolsas Cortesía</TableHead>
                      <TableHead>Fecha de baja</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comunidadesFiltradasBD.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(c.fechaInscripcion).toLocaleDateString('es-GT')}
                        </TableCell>
                        <TableCell>{c.departamento}</TableCell>
                        <TableCell>{c.municipio}</TableCell>
                        <TableCell>{c.aldeas}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.caseriosQueAtienden}</TableCell>
                        <TableCell className="text-center">{c.qtyCaseriosQueAtienden}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.ubicacionGoogleMaps || '-'}</TableCell>
                        <TableCell>{c.liderNumero}</TableCell>
                        <TableCell>{c.asistenteLideresDEM || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.comiteComunitario}</TableCell>
                        <TableCell>
                          <Badge className={
                            c.estado === 'ACTIVA' 
                              ? 'bg-green-100 text-green-800' 
                              : c.estado === 'SUSPENDIDA'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }>
                            {c.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{c.cantidadFamiliasEnComunidad}</TableCell>
                        <TableCell className="text-center">{c.cantidadFamEnRA}</TableCell>
                        <TableCell className="text-center">{c.primeraInfancia0a2Mujeres}</TableCell>
                        <TableCell className="text-center">{c.primeraInfancia0a2Hombres}</TableCell>
                        <TableCell className="text-center">{c.ninez3a5Mujeres}</TableCell>
                        <TableCell className="text-center">{c.ninez3a5Hombres}</TableCell>
                        <TableCell className="text-center">{c.jovenes6a10Mujeres}</TableCell>
                        <TableCell className="text-center">{c.jovenes6a10Hombres}</TableCell>
                        <TableCell className="text-center">{c.adolescentes11a18Mujeres}</TableCell>
                        <TableCell className="text-center">{c.adolescentes11a18Hombres}</TableCell>
                        <TableCell className="text-center">{c.adultos19a60Mujeres}</TableCell>
                        <TableCell className="text-center">{c.adultos19a60Hombres}</TableCell>
                        <TableCell className="text-center">{c.adultosMayor61Mujeres}</TableCell>
                        <TableCell className="text-center">{c.adultosMayor61Hombres}</TableCell>
                        <TableCell className="text-center">{c.mujeresGestantes}</TableCell>
                        <TableCell className="text-center">{c.mujeresLactantes}</TableCell>
                        <TableCell>{c.clasificacion || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.capacidadAlmacenamiento || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.formasColocacionInteres || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.fotografiaReferencia || '-'}</TableCell>
                        <TableCell>{c.tipoColocacion || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.grupoWhatsapp || '-'}</TableCell>
                        <TableCell>{c.book || '-'}</TableCell>
                        <TableCell className="text-center">{c.bolsasMaximo || 0}</TableCell>
                        <TableCell className="text-center">{c.bolsasCortesia || 0}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {c.fechaBaja ? new Date(c.fechaBaja).toLocaleDateString('es-GT') : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{c.motivoSuspencionOBaja || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
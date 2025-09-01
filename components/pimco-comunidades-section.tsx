'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Users, Plus, Edit, Trash2, Download, Filter, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ComunidadPimco {
  id: string
  nombreComunidad: string
  departamento: string
  municipio: string
  corregimiento: string
  vereda: string
  numeroFamilias: number
  numeroPersonas: number
  coordinadorComunitario: string
  telefonoCoordinador: string
  fechaCreacion?: string
  createdAt?: string
  estado: 'ACTIVO' | 'INACTIVO' | 'EN_PROCESO'
  observaciones: string
  _count?: {
    entrevistas: number
  }
}

export default function PimcoComunidadesSection() {
  const [comunidades, setComunidades] = useState<ComunidadPimco[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    departamento: 'todos',
    estado: 'todos'
  })
  const [modalAbierto, setModalAbierto] = useState(false)
  const [comunidadEditando, setComunidadEditando] = useState<ComunidadPimco | null>(null)
  const [formData, setFormData] = useState<Partial<ComunidadPimco>>({})
  
  const { toast } = useToast()

  // Cargar comunidades desde la API
  const cargarComunidades = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/comunidades-pimco')
      if (!response.ok) throw new Error('Error al cargar comunidades')
      
      const data = await response.json()
      setComunidades(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las comunidades",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    cargarComunidades()
  }, [cargarComunidades])

  // Filtrar comunidades
  const comunidadesFiltradas = comunidades.filter(comunidad => {
    return (
      comunidad.nombreComunidad.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      comunidad.municipio.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      comunidad.coordinadorComunitario.toLowerCase().includes(filtros.busqueda.toLowerCase())
    ) &&
    (filtros.departamento === 'todos' || filtros.departamento === '' || comunidad.departamento === filtros.departamento) &&
    (filtros.estado === 'todos' || filtros.estado === '' || comunidad.estado === filtros.estado)
  })

  const abrirModal = (comunidad?: ComunidadPimco) => {
    if (comunidad) {
      setComunidadEditando(comunidad)
      setFormData(comunidad)
    } else {
      setComunidadEditando(null)
      setFormData({
        nombreComunidad: '',
        departamento: '',
        municipio: '',
        corregimiento: '',
        vereda: '',
        numeroFamilias: 0,
        numeroPersonas: 0,
        coordinadorComunitario: '',
        telefonoCoordinador: '',
        estado: 'ACTIVO',
        observaciones: ''
      })
    }
    setModalAbierto(true)
  }

  const guardarComunidad = async () => {
    try {
      if (comunidadEditando) {
        // Editar existente (implementaremos PUT más tarde)
        toast({
          title: "Info",
          description: "Función de edición en desarrollo",
          variant: "default"
        })
      } else {
        // Crear nueva
        const response = await fetch('/api/comunidades-pimco', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) throw new Error('Error al crear comunidad')

        await cargarComunidades() // Recargar lista
        toast({
          title: "Éxito",
          description: "Comunidad creada exitosamente",
          variant: "default"
        })
      }
      
      setModalAbierto(false)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la comunidad",
        variant: "destructive"
      })
    }
  }

  const eliminarComunidad = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta comunidad?')) return

    try {
      // Implementaremos DELETE más tarde
      console.log('Eliminando comunidad con ID:', id)
      toast({
        title: "Info",
        description: "Función de eliminación en desarrollo",
        variant: "default"
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la comunidad",
        variant: "destructive"
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      ACTIVO: 'bg-green-100 text-green-800',
      INACTIVO: 'bg-red-100 text-red-800',
      EN_PROCESO: 'bg-yellow-100 text-yellow-800'
    }
    return estilos[estado as keyof typeof estilos] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoTexto = (estado: string) => {
    const textos = {
      ACTIVO: 'Activo',
      INACTIVO: 'Inactivo',
      EN_PROCESO: 'En Proceso'
    }
    return textos[estado as keyof typeof textos] || estado
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando comunidades...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Comunidades PIMCO
          </h2>
          <p className="text-muted-foreground">
            Gestión de comunidades del programa PIMCO
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Comunidad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {comunidadEditando ? 'Editar Comunidad' : 'Nueva Comunidad'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreComunidad">Nombre de la Comunidad</Label>
                  <Input
                    id="nombreComunidad"
                    value={formData.nombreComunidad || ''}
                    onChange={(e) => setFormData({...formData, nombreComunidad: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    value={formData.departamento || ''}
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio">Municipio</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio || ''}
                    onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corregimiento">Corregimiento</Label>
                  <Input
                    id="corregimiento"
                    value={formData.corregimiento || ''}
                    onChange={(e) => setFormData({...formData, corregimiento: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vereda">Vereda</Label>
                  <Input
                    id="vereda"
                    value={formData.vereda || ''}
                    onChange={(e) => setFormData({...formData, vereda: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroFamilias">Número de Familias</Label>
                  <Input
                    id="numeroFamilias"
                    type="number"
                    value={formData.numeroFamilias || ''}
                    onChange={(e) => setFormData({...formData, numeroFamilias: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroPersonas">Número de Personas</Label>
                  <Input
                    id="numeroPersonas"
                    type="number"
                    value={formData.numeroPersonas || ''}
                    onChange={(e) => setFormData({...formData, numeroPersonas: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinadorComunitario">Coordinador Comunitario</Label>
                  <Input
                    id="coordinadorComunitario"
                    value={formData.coordinadorComunitario || ''}
                    onChange={(e) => setFormData({...formData, coordinadorComunitario: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoCoordinador">Teléfono del Coordinador</Label>
                  <Input
                    id="telefonoCoordinador"
                    value={formData.telefonoCoordinador || ''}
                    onChange={(e) => setFormData({...formData, telefonoCoordinador: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select 
                    value={formData.estado || ''} 
                    onValueChange={(value: 'ACTIVO' | 'INACTIVO' | 'EN_PROCESO') => 
                      setFormData({...formData, estado: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">Activo</SelectItem>
                      <SelectItem value="INACTIVO">Inactivo</SelectItem>
                      <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarComunidad}>
                  {comunidadEditando ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Comunidades</p>
                <p className="text-2xl font-bold">{comunidades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Familias</p>
                <p className="text-2xl font-bold">{comunidades.reduce((acc, c) => acc + c.numeroFamilias, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Personas</p>
                <p className="text-2xl font-bold">{comunidades.reduce((acc, c) => acc + c.numeroPersonas, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold">{comunidades.filter(c => c.estado === 'ACTIVO').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
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
              <Label htmlFor="busqueda">Buscar</Label>
              <Input
                id="busqueda"
                placeholder="Nombre, municipio o coordinador..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtroDepartamento">Departamento</Label>
              <Select
                value={filtros.departamento}
                onValueChange={(value) => setFiltros({...filtros, departamento: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Guatemala">Guatemala</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtroEstado">Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(value) => setFiltros({...filtros, estado: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de comunidades */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Comunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Familias</TableHead>
                  <TableHead>Personas</TableHead>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comunidadesFiltradas.map((comunidad) => (
                  <TableRow key={comunidad.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{comunidad.nombreComunidad}</p>
                        <p className="text-sm text-gray-500">{comunidad.vereda}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{comunidad.departamento}</p>
                        <p className="text-gray-500">{comunidad.municipio}</p>
                        <p className="text-gray-400">{comunidad.corregimiento}</p>
                      </div>
                    </TableCell>
                    <TableCell>{comunidad.numeroFamilias}</TableCell>
                    <TableCell>{comunidad.numeroPersonas}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{comunidad.coordinadorComunitario}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{comunidad.telefonoCoordinador}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadge(comunidad.estado)}>
                        {getEstadoTexto(comunidad.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(comunidad.fechaCreacion || comunidad.createdAt || new Date()).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(comunidad)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarComunidad(comunidad.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Users, Plus, Edit, Trash2, Download, Filter, Loader2, ExternalLink } from 'lucide-react'

interface ComunidadPimco {
  id: string
  departamento: string
  municipio: string
  aldeas: string
  caseriosQueAtienden: string
  qtyCaseriosQueAtienden: number
  ubicacionGoogleMaps?: string
  liderNumero: string
  comiteComunitario: string
  activa: boolean
  cantidadFamiliasEnComunidad: number
  cantidadFamEnRA: number
  fotografiaReferencia?: string
  motivoSuspencionOBaja?: string
  fechaCreacion?: string
  createdAt?: string
  _count?: {
    entrevistas: number
  }
}

export default function PimcoComunidadesSection() {
  const [comunidades, setComunidades] = useState<ComunidadPimco[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComunidad, setEditingComunidad] = useState<ComunidadPimco | null>(null)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    departamento: 'todos',
    activa: 'todos'
  })
  const [formData, setFormData] = useState({
    departamento: '',
    municipio: '',
    aldeas: '',
    caseriosQueAtienden: '',
    qtyCaseriosQueAtienden: 0,
    ubicacionGoogleMaps: '',
    liderNumero: '',
    comiteComunitario: '',
    activa: true,
    cantidadFamiliasEnComunidad: 0,
    cantidadFamEnRA: 0,
    fotografiaReferencia: '',
    motivoSuspencionOBaja: ''
  })

  useEffect(() => {
    const cargarComunidades = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/comunidades-pimco')
        if (!response.ok) throw new Error('Error al cargar comunidades')
        
        const data = await response.json()
        setComunidades(data)
      } catch (error) {
        console.error('Error al cargar comunidades:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarComunidades()
  }, []) // Solo ejecutar una vez al montar el componente

  const resetForm = () => {
    setFormData({
      departamento: '',
      municipio: '',
      aldeas: '',
      caseriosQueAtienden: '',
      qtyCaseriosQueAtienden: 0,
      ubicacionGoogleMaps: '',
      liderNumero: '',
      comiteComunitario: '',
      activa: true,
      cantidadFamiliasEnComunidad: 0,
      cantidadFamEnRA: 0,
      fotografiaReferencia: '',
      motivoSuspencionOBaja: ''
    })
    setEditingComunidad(null)
  }

  const abrirModal = (comunidad?: ComunidadPimco) => {
    if (comunidad) {
      setEditingComunidad(comunidad)
      setFormData({
        departamento: comunidad.departamento,
        municipio: comunidad.municipio,
        aldeas: comunidad.aldeas,
        caseriosQueAtienden: comunidad.caseriosQueAtienden,
        qtyCaseriosQueAtienden: comunidad.qtyCaseriosQueAtienden,
        ubicacionGoogleMaps: comunidad.ubicacionGoogleMaps || '',
        liderNumero: comunidad.liderNumero,
        comiteComunitario: comunidad.comiteComunitario,
        activa: comunidad.activa,
        cantidadFamiliasEnComunidad: comunidad.cantidadFamiliasEnComunidad,
        cantidadFamEnRA: comunidad.cantidadFamEnRA,
        fotografiaReferencia: comunidad.fotografiaReferencia || '',
        motivoSuspencionOBaja: comunidad.motivoSuspencionOBaja || ''
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const guardarComunidad = async () => {
    try {
      setLoading(true)
      const method = editingComunidad ? 'PUT' : 'POST'
      const url = editingComunidad 
        ? `/api/comunidades-pimco/${editingComunidad.id}` 
        : '/api/comunidades-pimco'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Error al guardar comunidad')

      // Recargar datos
      await cargarComunidades()
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error al guardar comunidad:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarComunidades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/comunidades-pimco')
      if (!response.ok) throw new Error('Error al cargar comunidades')
      
      const data = await response.json()
      setComunidades(data)
    } catch (error) {
      console.error('Error al cargar comunidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const eliminarComunidad = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta comunidad?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/comunidades-pimco/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar comunidad')

      // Recargar datos
      await cargarComunidades()
    } catch (error) {
      console.error('Error al eliminar comunidad:', error)
    } finally {
      setLoading(false)
    }
  }

  const comunidadesFiltradas = comunidades.filter(comunidad => {
    return (
      comunidad.aldeas.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      comunidad.municipio.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      comunidad.liderNumero.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      comunidad.comiteComunitario.toLowerCase().includes(filtros.busqueda.toLowerCase())
    ) &&
    (filtros.departamento === 'todos' || filtros.departamento === '' || comunidad.departamento === filtros.departamento) &&
    (filtros.activa === 'todos' || filtros.activa === '' || 
     (filtros.activa === 'true' && comunidad.activa) || 
     (filtros.activa === 'false' && !comunidad.activa))
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Gestión de comunidades del programa PIMCO
          </h2>
          <p className="text-muted-foreground">
            Administra las comunidades atendidas por el programa PIMCO
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => abrirModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Comunidad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingComunidad ? 'Editar Comunidad PIMCO' : 'Nueva Comunidad PIMCO'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, departamento: value }))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecciona departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Guatemala">Guatemala</SelectItem>
                        <SelectItem value="Sacatepéquez">Sacatepéquez</SelectItem>
                        <SelectItem value="Chimaltenango">Chimaltenango</SelectItem>
                        <SelectItem value="Escuintla">Escuintla</SelectItem>
                        <SelectItem value="Santa Rosa">Santa Rosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="municipio">Municipio *</Label>
                    <Input
                      id="municipio"
                      value={formData.municipio}
                      onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
                      placeholder="Nombre del municipio"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="aldeas">Aldeas *</Label>
                  <Input
                    id="aldeas"
                    value={formData.aldeas}
                    onChange={(e) => setFormData(prev => ({ ...prev, aldeas: e.target.value }))}
                    placeholder="Nombre de las aldeas"
                  />
                </div>
                <div>
                  <Label htmlFor="caserios">Caseríos que Atienden</Label>
                  <Textarea
                    id="caserios"
                    value={formData.caseriosQueAtienden}
                    onChange={(e) => setFormData(prev => ({ ...prev, caseriosQueAtienden: e.target.value }))}
                    placeholder="Lista de caseríos separados por comas"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qtyCaserios">Cantidad de Caseríos</Label>
                    <Input
                      id="qtyCaserios"
                      type="number"
                      value={formData.qtyCaseriosQueAtienden}
                      onChange={(e) => setFormData(prev => ({ ...prev, qtyCaseriosQueAtienden: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="liderNumero">Líder / Número *</Label>
                    <Input
                      id="liderNumero"
                      value={formData.liderNumero}
                      onChange={(e) => setFormData(prev => ({ ...prev, liderNumero: e.target.value }))}
                      placeholder="Nombre del líder y número de teléfono"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ubicacion">Ubicación Google Maps</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacionGoogleMaps}
                    onChange={(e) => setFormData(prev => ({ ...prev, ubicacionGoogleMaps: e.target.value }))}
                    placeholder="Enlace o coordenadas de Google Maps"
                  />
                </div>
                <div>
                  <Label htmlFor="comite">Comité Comunitario</Label>
                  <Input
                    id="comite"
                    value={formData.comiteComunitario}
                    onChange={(e) => setFormData(prev => ({ ...prev, comiteComunitario: e.target.value }))}
                    placeholder="Información del comité comunitario"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="familiasComunidad">Familias en Comunidad</Label>
                    <Input
                      id="familiasComunidad"
                      type="number"
                      value={formData.cantidadFamiliasEnComunidad}
                      onChange={(e) => setFormData(prev => ({ ...prev, cantidadFamiliasEnComunidad: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="familiasRA">Familias en RUA</Label>
                    <Input
                      id="familiasRA"
                      type="number"
                      value={formData.cantidadFamEnRA}
                      onChange={(e) => setFormData(prev => ({ ...prev, cantidadFamEnRA: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activa">Estado</Label>
                    <Select
                      value={formData.activa.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, activa: value === 'true' }))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activa</SelectItem>
                        <SelectItem value="false">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fotografia">Fotografía de Referencia</Label>
                  <Input
                    id="fotografia"
                    value={formData.fotografiaReferencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, fotografiaReferencia: e.target.value }))}
                    placeholder="URL de la fotografía"
                  />
                </div>
                {!formData.activa && (
                  <div>
                    <Label htmlFor="motivo">Motivo de Suspensión/Baja</Label>
                    <Textarea
                      id="motivo"
                      value={formData.motivoSuspencionOBaja}
                      onChange={(e) => setFormData(prev => ({ ...prev, motivoSuspencionOBaja: e.target.value }))}
                      placeholder="Explica el motivo de la suspensión o baja"
                      rows={3}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={guardarComunidad} disabled={loading}>
                    {loading ? 'Guardando...' : editingComunidad ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                <p className="text-2xl font-bold">{comunidades.reduce((acc, c) => acc + c.cantidadFamiliasEnComunidad, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Familias en RUA</p>
                <p className="text-2xl font-bold">{comunidades.reduce((acc, c) => acc + c.cantidadFamEnRA, 0)}</p>
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
                <p className="text-2xl font-bold">{comunidades.filter(c => c.activa).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                placeholder="Aldea, municipio, líder o comité..."
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
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Guatemala">Guatemala</SelectItem>
                  <SelectItem value="Sacatepéquez">Sacatepéquez</SelectItem>
                  <SelectItem value="Chimaltenango">Chimaltenango</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtroActiva">Estado</Label>
              <Select
                value={filtros.activa}
                onValueChange={(value) => setFiltros({...filtros, activa: value})}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Activas</SelectItem>
                  <SelectItem value="false">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Comunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Aldeas</TableHead>
                  <TableHead>Caseríos que Atienden</TableHead>
                  <TableHead>QTY Caseríos</TableHead>
                  <TableHead>Ubicación Google Maps</TableHead>
                  <TableHead>Líder / Número</TableHead>
                  <TableHead>Comité Comunitario</TableHead>
                  <TableHead>Activa/Inactiva</TableHead>
                  <TableHead>Familias en Comunidad</TableHead>
                  <TableHead>Familias en RUA</TableHead>
                  <TableHead>Fotografía</TableHead>
                  <TableHead>Motivo Suspensión</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comunidadesFiltradas.map((comunidad) => (
                  <TableRow key={comunidad.id}>
                    <TableCell className="font-medium">{comunidad.departamento}</TableCell>
                    <TableCell>{comunidad.municipio}</TableCell>
                    <TableCell>{comunidad.aldeas}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={comunidad.caseriosQueAtienden}>
                        {comunidad.caseriosQueAtienden}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{comunidad.qtyCaseriosQueAtienden}</TableCell>
                    <TableCell>
                      {comunidad.ubicacionGoogleMaps && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={comunidad.ubicacionGoogleMaps} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{comunidad.liderNumero}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={comunidad.comiteComunitario}>
                        {comunidad.comiteComunitario}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={comunidad.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {comunidad.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{comunidad.cantidadFamiliasEnComunidad}</TableCell>
                    <TableCell className="text-center">{comunidad.cantidadFamEnRA}</TableCell>
                    <TableCell>
                      {comunidad.fotografiaReferencia && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={comunidad.fotografiaReferencia} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            📷
                          </a>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={comunidad.motivoSuspencionOBaja || ''}>
                        {comunidad.motivoSuspencionOBaja || '-'}
                      </div>
                    </TableCell>
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
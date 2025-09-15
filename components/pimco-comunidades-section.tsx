'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { MapPin, Users, Plus, Edit, Trash2, Download, Filter, Loader2, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  const [filtros, setFiltros] = useState({
    busqueda: '',
    departamento: 'todos',
    activa: 'todos'
  })
  
  const { toast } = useToast()

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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Comunidad
          </Button>
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
                <p className="text-sm text-gray-600">Familias en RA</p>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                  <TableHead>Familias en RA</TableHead>
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
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
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
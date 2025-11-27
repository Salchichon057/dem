/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, Pencil, Trash2, MapPin, ExternalLink, Download, Users } from 'lucide-react'
import { Community } from '@/lib/types/community'
import { toast } from 'sonner'
import DateFilter from '@/components/shared/date-filter'

export default function CommunitiesTable() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(50)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'activa' | 'inactiva' | 'suspendida' | ''>('')
  const [classificationFilter, setClassificationFilter] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  // Cargar comunidades
  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (departmentFilter) params.append('department', departmentFilter)
      if (municipalityFilter) params.append('municipality', municipalityFilter)
      if (statusFilter) params.append('status', statusFilter)
      if (classificationFilter) params.append('classification', classificationFilter)
      if (selectedYear !== 'all') params.append('year', selectedYear)
      if (selectedMonth !== 'all') params.append('month', selectedMonth)

      const response = await fetch(`/api/communities?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = 'Error al cargar comunidades'
        if (errorData.code === '42501') {
          errorMessage = 'Error de permisos RLS'
        } else if (errorData.details) {
          errorMessage = `Error: ${errorData.details}`
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setCommunities(data.communities || [])
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar comunidades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [currentPage, searchTerm, departmentFilter, municipalityFilter, statusFilter, classificationFilter, selectedYear, selectedMonth])

  // Exportar a Excel
  const handleExport = async () => {
    toast.info('Exportación en construcción')
  }

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando comunidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comunidades Beneficiarias</h2>
          <p className="text-muted-foreground">
            {total} {total === 1 ? 'comunidad registrada' : 'comunidades registradas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Comunidad
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aldea o líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={departmentFilter || 'all'} onValueChange={(value) => setDepartmentFilter(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Chimaltenango">Chimaltenango</SelectItem>
            <SelectItem value="Guatemala">Guatemala</SelectItem>
            <SelectItem value="Sacatepéquez">Sacatepéquez</SelectItem>
          </SelectContent>
        </Select>

        <Select value={municipalityFilter || 'all'} onValueChange={(value) => setMunicipalityFilter(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Municipio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="San Martin Jilotepeque">San Martin Jilotepeque</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value as typeof statusFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="inactiva">Inactiva</SelectItem>
            <SelectItem value="suspendida">Suspendida</SelectItem>
          </SelectContent>
        </Select>

        <Select value={classificationFilter || 'all'} onValueChange={(value) => setClassificationFilter(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Clasificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Pequeña">Pequeña (1-50)</SelectItem>
            <SelectItem value="Mediana">Mediana (51-150)</SelectItem>
            <SelectItem value="Grande">Grande (&gt;150)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Date Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha de Registro:</span>
        <DateFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          showIcons={false}
        />
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aldea/Comunidad</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Familias</TableHead>
              <TableHead>Clasificación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Inscripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {communities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No se encontraron comunidades
                </TableCell>
              </TableRow>
            ) : (
              communities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div>{community.villages || 'Sin nombre'}</div>
                        {community.hamlets_count && (
                          <div className="text-xs text-muted-foreground">
                            {community.hamlets_count} {community.hamlets_count === 1 ? 'caserío' : 'caseríos'}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{community.department}</TableCell>
                  <TableCell>{community.municipality}</TableCell>
                  <TableCell>
                    {community.leader_name ? (
                      <div>
                        <div className="text-sm">{community.leader_name}</div>
                        {community.leader_phone && (
                          <div className="text-xs text-muted-foreground">{community.leader_phone}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{community.total_families || 0}</span>
                      {community.families_in_ra && (
                        <span className="text-xs text-muted-foreground">
                          ({community.families_in_ra} RA)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {community.classification ? (
                      <Badge variant={
                        community.classification === 'Grande' ? 'default' :
                        community.classification === 'Mediana' ? 'secondary' : 'outline'
                      }>
                        {community.classification}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      community.status === 'activa' ? 'default' :
                      community.status === 'suspendida' ? 'destructive' : 'secondary'
                    }>
                      {community.status === 'activa' ? 'Activa' : 
                       community.status === 'suspendida' ? 'Suspendida' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(community.registration_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {community.google_maps_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(community.google_maps_url || '', '_blank')}
                          title="Ver en Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages} • {total} {total === 1 ? 'resultado' : 'resultados'} en total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Última
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

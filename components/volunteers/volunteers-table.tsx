/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserPermissions } from '@/hooks/use-user-permissions'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, Pencil, Calendar, Clock, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Volunteer } from '@/lib/types'
import DateFilter from '@/components/shared/date-filter'

interface VolunteersResponse {
  volunteers: Volunteer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function VolunteersTable() {
  const { canCreate, canEdit } = useUserPermissions();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [volunteerTypeFilter, setVolunteerTypeFilter] = useState<string>('all')
  const [shiftFilter, setShiftFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 50

  const [organizations, setOrganizations] = useState<string[]>([])

  // Cargar opciones dinámicas al montar
  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    fetchVolunteers()
  }, [searchTerm, volunteerTypeFilter, shiftFilter, statusFilter, selectedYear, selectedMonth, currentPage])

  // Reset a página 1 cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, volunteerTypeFilter, shiftFilter, statusFilter, selectedYear, selectedMonth])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/volunteers?limit=1000')
      if (response.ok) {
        const data: VolunteersResponse = await response.json()
        const uniqueOrgs = [...new Set(data.volunteers.map(v => v.organization).filter(Boolean))] as string[]
        setOrganizations(uniqueOrgs.sort())
      }
    } catch (error) {
      console.error('Error al cargar organizaciones:', error)
    }
  }

  const fetchVolunteers = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })

      if (searchTerm) params.set('search', searchTerm)
      if (volunteerTypeFilter !== 'all') params.set('volunteer_type', volunteerTypeFilter)
      if (shiftFilter !== 'all') params.set('shift', shiftFilter)
      if (statusFilter !== 'all') params.set('is_active', statusFilter)
      if (selectedYear !== 'all') params.set('year', selectedYear)
      if (selectedMonth !== 'all') params.set('month', selectedMonth)

      const response = await fetch(`/api/volunteers?${params}`)
      const data: VolunteersResponse = await response.json()

      if (response.ok) {
        setVolunteers(data.volunteers)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } else {
        toast.error('Error al cargar voluntarios')
      }
    } catch {
      toast.error('Error al cargar voluntarios')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return time // Ya viene en formato HH:MM
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando voluntarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{volunteers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <p className="text-2xl font-bold">
                {volunteers.filter(v => v.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Horas Hoy</p>
              <p className="text-2xl font-bold">
                {volunteers.reduce((sum, v) => sum + v.total_hours, 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Con Beneficio</p>
              <p className="text-2xl font-bold">
                {volunteers.filter(v => v.receives_benefit).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={volunteerTypeFilter} onValueChange={setVolunteerTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo de voluntario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Comunidad">Comunidad</SelectItem>
              <SelectItem value="ONG Aliada">ONG Aliada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los turnos</SelectItem>
              <SelectItem value="Diurno">Diurno</SelectItem>
              <SelectItem value="Nocturno">Nocturno</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {canCreate() && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Voluntario
            </Button>
          )}
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha de Registro:</span>
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            showIcons={false}
          />
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead>Beneficio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No se encontraron voluntarios
                  </TableCell>
                </TableRow>
              ) : (
                volunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell className="font-medium">{volunteer.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{volunteer.volunteer_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {volunteer.organization || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={volunteer.shift === 'Diurno' ? 'default' : 'secondary'}>
                        {volunteer.shift}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatTime(volunteer.entry_time)} - {formatTime(volunteer.exit_time)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {volunteer.total_hours}h
                    </TableCell>
                    <TableCell>
                      {volunteer.receives_benefit ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Sí</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(volunteer.work_date)}
                    </TableCell>
                    <TableCell>
                      <Badge className={volunteer.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}>
                        {volunteer.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit() && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Paginador */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lsaquo;
          </Button>
          
          {(() => {
            const startPage = Math.max(1, currentPage - 1)
            const endPage = Math.min(totalPages, startPage + 2)
            const pages = []
            for (let i = startPage; i <= endPage; i++) {
              pages.push(i)
            }
            return pages.map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))
          })()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </Button>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Mostrando {volunteers.length} de {total} voluntario{total !== 1 ? 's' : ''}</p>
        <p>Total de horas: {volunteers.reduce((sum, v) => sum + v.total_hours, 0)}h</p>
      </div>
    </div>
  )
}


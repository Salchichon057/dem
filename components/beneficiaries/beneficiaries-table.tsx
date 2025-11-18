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
import { Plus, Search, Eye, Pencil, Trash2, Settings2 } from 'lucide-react'
import { Beneficiary, } from '@/lib/types'
import { toast } from 'sonner'
import BeneficiaryForm from './beneficiary-form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function BeneficiariesTable() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [allBeneficiaries, setAllBeneficiaries] = useState<Beneficiary[]>([]) // Para generar filtros dinámicos
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(50) // 50 items por página

  // Form modal state
  const [formOpen, setFormOpen] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all')
  const [selectedProgram, setSelectedProgram] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Dynamic filter options (extracted from actual data)
  const [departments, setDepartments] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    ageGender: true,
    department: true,
    municipality: true,
    village: true,
    program: true,
    status: true,
    admissionDate: true,
  })

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const toggleAllColumns = () => {
    const allChecked = Object.values(visibleColumns).every(v => v)
    const newState = Object.keys(visibleColumns).reduce((acc, key) => {
      acc[key as keyof typeof visibleColumns] = !allChecked
      return acc
    }, {} as typeof visibleColumns)
    setVisibleColumns(newState)
  }

  const allColumnsChecked = Object.values(visibleColumns).every(v => v)
  const someColumnsChecked = Object.values(visibleColumns).some(v => v) && !allColumnsChecked

  // Load all beneficiaries once to generate filter options
  useEffect(() => {
    fetchAllBeneficiaries()
  }, [])

  // Fetch all beneficiaries (without filters) to populate filter dropdowns
  const fetchAllBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries')
      const data = await response.json()

      if (response.ok) {
        setAllBeneficiaries(data.beneficiaries)
        
        // Extract unique departments
        const uniqueDepts = [...new Set(data.beneficiaries.map((b: Beneficiary) => b.department))] as string[]
        setDepartments(uniqueDepts.sort())
        
        // Extract unique programs
        const uniquePrograms = [...new Set(data.beneficiaries.map((b: Beneficiary) => b.program))] as string[]
        setPrograms(uniquePrograms.sort())
      }
    } catch (error) {
      console.error('Error fetching all beneficiaries:', error)
    }
  }

  // Update municipalities when department changes (from actual data)
  useEffect(() => {
    if (selectedDepartment && selectedDepartment !== 'all') {
      const munis = allBeneficiaries
        .filter(b => b.department === selectedDepartment)
        .map(b => b.municipality)
      const uniqueMunis = [...new Set(munis)].sort()
      setMunicipalities(uniqueMunis)
      setSelectedMunicipality('all')
    } else {
      setMunicipalities([])
    }
  }, [selectedDepartment, allBeneficiaries])

  // Fetch beneficiaries
  const fetchBeneficiaries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Agregar paginación
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedDepartment && selectedDepartment !== 'all') params.append('department', selectedDepartment)
      if (selectedMunicipality && selectedMunicipality !== 'all') params.append('municipality', selectedMunicipality)
      if (selectedProgram && selectedProgram !== 'all') params.append('program', selectedProgram)
      if (selectedStatus && selectedStatus !== 'all') params.append('is_active', selectedStatus)

      const response = await fetch(`/api/beneficiaries?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setBeneficiaries(data.beneficiaries)
        setTotal(data.total)
        setTotalPages(data.totalPages || 1)
      } else {
        toast.error('Error al cargar beneficiarios')
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error)
      toast.error('Error al cargar beneficiarios')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchBeneficiaries()
  }, [searchTerm, selectedDepartment, selectedMunicipality, selectedProgram, selectedStatus, currentPage])

  // Reset a página 1 cuando cambian los filtros (excepto cuando cambia currentPage)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, selectedMunicipality, selectedProgram, selectedStatus])

  // Delete beneficiary
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de eliminar a ${name}?`)) return

    try {
      const response = await fetch(`/api/beneficiaries/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Beneficiario eliminado')
        fetchBeneficiaries() // Reload list
      } else {
        toast.error('Error al eliminar beneficiario')
      }
    } catch (error) {
      console.error('Error deleting beneficiary:', error)
      toast.error('Error al eliminar beneficiario')
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDepartment('all')
    setSelectedMunicipality('all')
    setSelectedProgram('all')
    setSelectedStatus('all')
    setCurrentPage(1) // Reset a la primera página
  }

  // Open form for adding
  const handleAdd = () => {
    setSelectedBeneficiary(null)
    setFormOpen(true)
  }

  // Open form for editing
  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setFormOpen(true)
  }

  // On form success, reload list
  const handleFormSuccess = () => {
    fetchBeneficiaries()
  }

  return (
    <div className="space-y-6">
      {/* Form Modal */}
      <BeneficiaryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        beneficiary={selectedBeneficiary}
        onSuccess={handleFormSuccess}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lista de Beneficiarios</h2>
          <p className="text-muted-foreground">Total: {total} beneficiarios</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Configurar columnas">
                <Settings2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Columnas visibles</h3>
                <div className="space-y-3">
                  {/* Select All */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="col-all"
                      checked={allColumnsChecked}
                      onCheckedChange={toggleAllColumns}
                      className={someColumnsChecked ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                    <Label htmlFor="col-all" className="text-sm cursor-pointer font-medium">
                      Seleccionar todo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-name"
                      checked={visibleColumns.name}
                      onCheckedChange={() => toggleColumn('name')}
                    />
                    <Label htmlFor="col-name" className="text-sm cursor-pointer">Nombre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-age"
                      checked={visibleColumns.ageGender}
                      onCheckedChange={() => toggleColumn('ageGender')}
                    />
                    <Label htmlFor="col-age" className="text-sm cursor-pointer">Edad / Género</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-dept"
                      checked={visibleColumns.department}
                      onCheckedChange={() => toggleColumn('department')}
                    />
                    <Label htmlFor="col-dept" className="text-sm cursor-pointer">Departamento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-muni"
                      checked={visibleColumns.municipality}
                      onCheckedChange={() => toggleColumn('municipality')}
                    />
                    <Label htmlFor="col-muni" className="text-sm cursor-pointer">Municipio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-village"
                      checked={visibleColumns.village}
                      onCheckedChange={() => toggleColumn('village')}
                    />
                    <Label htmlFor="col-village" className="text-sm cursor-pointer">Aldea</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-program"
                      checked={visibleColumns.program}
                      onCheckedChange={() => toggleColumn('program')}
                    />
                    <Label htmlFor="col-program" className="text-sm cursor-pointer">Programa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-status"
                      checked={visibleColumns.status}
                      onCheckedChange={() => toggleColumn('status')}
                    />
                    <Label htmlFor="col-status" className="text-sm cursor-pointer">Estado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-admission"
                      checked={visibleColumns.admissionDate}
                      onCheckedChange={() => toggleColumn('admissionDate')}
                    />
                    <Label htmlFor="col-admission" className="text-sm cursor-pointer">Fecha Ingreso</Label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Agregar Beneficiario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Department */}
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Municipality */}
        <Select
          value={selectedMunicipality}
          onValueChange={setSelectedMunicipality}
          disabled={!selectedDepartment || selectedDepartment === 'all'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Municipio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los municipios</SelectItem>
            {municipalities.map((muni) => (
              <SelectItem key={muni} value={muni}>
                {muni}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Program */}
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger>
            <SelectValue placeholder="Programa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los programas</SelectItem>
            {programs.map((prog) => (
              <SelectItem key={prog} value={prog}>
                {prog}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button */}
      {(searchTerm || selectedDepartment !== 'all' || selectedMunicipality !== 'all' || selectedProgram !== 'all' || selectedStatus !== 'all') && (
        <Button variant="outline" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.name && <TableHead>Nombre</TableHead>}
              {visibleColumns.ageGender && <TableHead>Edad / Género</TableHead>}
              {visibleColumns.department && <TableHead>Departamento</TableHead>}
              {visibleColumns.municipality && <TableHead>Municipio</TableHead>}
              {visibleColumns.village && <TableHead>Aldea</TableHead>}
              {visibleColumns.program && <TableHead>Programa</TableHead>}
              {visibleColumns.status && <TableHead>Estado</TableHead>}
              {visibleColumns.admissionDate && <TableHead>Fecha Ingreso</TableHead>}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : beneficiaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-8 text-muted-foreground">
                  No se encontraron beneficiarios
                </TableCell>
              </TableRow>
            ) : (
              beneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id}>
                  {visibleColumns.name && <TableCell className="font-medium">{beneficiary.name}</TableCell>}
                  {visibleColumns.ageGender && (
                    <TableCell>
                      {beneficiary.age} años / {beneficiary.gender}
                    </TableCell>
                  )}
                  {visibleColumns.department && <TableCell>{beneficiary.department}</TableCell>}
                  {visibleColumns.municipality && <TableCell>{beneficiary.municipality}</TableCell>}
                  {visibleColumns.village && <TableCell>{beneficiary.village || '-'}</TableCell>}
                  {visibleColumns.program && <TableCell>{beneficiary.program}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge variant={beneficiary.is_active ? 'default' : 'secondary'}>
                        {beneficiary.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.admissionDate && (
                    <TableCell>
                      {new Date(beneficiary.admission_date).toLocaleDateString('es-GT')}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => handleEdit(beneficiary)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar"
                        onClick={() => handleDelete(beneficiary.id, beneficiary.name)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginador */}
      {!loading && beneficiaries.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, total)} de {total} beneficiarios
          </div>
          
          <div className="flex items-center gap-1">
            {/* Primera página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-9"
            >
              &laquo;
            </Button>
            
            {/* Anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9"
            >
              &lsaquo;
            </Button>
            
            {/* Números de página (solo 3) */}
            <div className="flex items-center gap-1">
              {(() => {
                const startPage = Math.max(1, currentPage - 1)
                const endPage = Math.min(totalPages, startPage + 2)
                
                const pages = []
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                      className="w-9"
                    >
                      {i}
                    </Button>
                  )
                }
                return pages
              })()}
            </div>
            
            {/* Siguiente */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9"
            >
              &rsaquo;
            </Button>
            
            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-9"
            >
              &raquo;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

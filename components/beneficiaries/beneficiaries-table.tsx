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
import { Plus, Search, Eye, Pencil, Trash2, Settings2, Image as ImageIcon, MapPin, ExternalLink, FileSpreadsheet } from 'lucide-react'
import { Beneficiary, } from '@/lib/types'
import { toast } from 'sonner'
import { exportToExcel, type ExcelColumn } from '@/lib/utils/excel-export'
import BeneficiaryForm from './beneficiary-form'
import PhotoPreviewModal from './photo-preview-modal'
import Image from 'next/image'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import DateFilter from '@/components/shared/date-filter'

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
  
  // Photo modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, name: string} | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all')
  const [selectedProgram, setSelectedProgram] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  // Dynamic filter options (extracted from actual data)
  const [departments, setDepartments] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    photo: true,
    name: true,
    ageGender: true,
    department: true,
    municipality: true,
    village: true,
    program: true,
    bag: true,
    googleMaps: true,
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

  // Download Excel function
  const handleDownloadExcel = () => {
    if (beneficiaries.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      const excelColumns: ExcelColumn[] = [
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Edad', key: 'age', width: 10 },
        { header: 'Género', key: 'gender', width: 15 },
        { header: 'Departamento', key: 'department', width: 20 },
        { header: 'Municipio', key: 'municipality', width: 20 },
        { header: 'Aldea', key: 'village', width: 20 },
        { header: 'Programa', key: 'program', width: 25 },
        { header: 'Cantidad de Bolsas', key: 'bag', width: 20 },
        { header: 'Estado', key: 'is_active', width: 15 },
        { header: 'Fecha de Ingreso', key: 'admission_date', width: 20 },
      ]

      const excelData = beneficiaries.map(b => ({
        name: b.name,
        age: b.age,
        gender: b.gender,
        department: b.department,
        municipality: b.municipality,
        village: b.village || '',
        program: b.program,
        bag: b.bag || '',
        is_active: b.is_active ? 'Activo' : 'Inactivo',
        admission_date: new Date(b.admission_date).toLocaleDateString('es-GT'),
      }))

      exportToExcel({
        fileName: 'beneficiarios',
        sheetName: 'Beneficiarios',
        columns: excelColumns,
        data: excelData,
        includeTimestamp: true,
      })

      toast.success(`Exportados ${beneficiaries.length} beneficiarios a Excel`)
    } catch {
      toast.error('Error al exportar el archivo')
    }
  }

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
    } catch {
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
      if (selectedYear && selectedYear !== 'all') params.append('year', selectedYear)
      if (selectedMonth && selectedMonth !== 'all') params.append('month', selectedMonth)

      const response = await fetch(`/api/beneficiaries?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setBeneficiaries(data.beneficiaries)
        setTotal(data.total)
        setTotalPages(data.totalPages || 1)
      } else {
        toast.error('Error al cargar beneficiarios')
      }
    } catch {
      toast.error('Error al cargar beneficiarios')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchBeneficiaries()
  }, [searchTerm, selectedDepartment, selectedMunicipality, selectedProgram, selectedStatus, selectedYear, selectedMonth, currentPage])

  // Reset a página 1 cuando cambian los filtros (excepto cuando cambia currentPage)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, selectedMunicipality, selectedProgram, selectedStatus, selectedYear, selectedMonth])

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
    } catch {
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
    setSelectedYear('all')
    setSelectedMonth('all')
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

  // Abrir modal de foto
  const handleViewPhoto = (photoUrl: string, name: string) => {
    setSelectedPhoto({ url: photoUrl, name })
    setPhotoModalOpen(true)
  }

  // Abrir Google Maps en nueva pestaña
  const handleOpenMaps = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
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

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <PhotoPreviewModal
          open={photoModalOpen}
          onOpenChange={setPhotoModalOpen}
          photoUrl={selectedPhoto.url}
          beneficiaryName={selectedPhoto.name}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lista de Beneficiarios</h2>
          <p className="text-muted-foreground">Total: {total} beneficiarios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadExcel} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </Button>
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
                      id="col-photo"
                      checked={visibleColumns.photo}
                      onCheckedChange={() => toggleColumn('photo')}
                    />
                    <Label htmlFor="col-photo" className="text-sm cursor-pointer">Foto</Label>
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
                      id="col-bag"
                      checked={visibleColumns.bag}
                      onCheckedChange={() => toggleColumn('bag')}
                    />
                    <Label htmlFor="col-bag" className="text-sm cursor-pointer">Cantidad de Bolsas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-maps"
                      checked={visibleColumns.googleMaps}
                      onCheckedChange={() => toggleColumn('googleMaps')}
                    />
                    <Label htmlFor="col-maps" className="text-sm cursor-pointer">Google Maps</Label>
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
          <Button className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            Agregar Beneficiario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
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
            <SelectItem value="all">Departamentos</SelectItem>
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
            <SelectItem value="all">Municipios</SelectItem>
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
        
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha de Ingreso:</span>
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            showIcons={false}
          />
        </div>
      </div>

      {/* Clear filters button */}
      {(searchTerm || selectedDepartment !== 'all' || selectedMunicipality !== 'all' || selectedProgram !== 'all' || selectedStatus !== 'all' || selectedYear !== 'all' || selectedMonth !== 'all') && (
        <Button variant="outline" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {visibleColumns.photo && <TableHead className="whitespace-nowrap">Foto</TableHead>}
              {visibleColumns.name && <TableHead className="whitespace-nowrap">Nombre</TableHead>}
              {visibleColumns.ageGender && <TableHead className="whitespace-nowrap">Edad / Género</TableHead>}
              {visibleColumns.department && <TableHead className="whitespace-nowrap">Departamento</TableHead>}
              {visibleColumns.municipality && <TableHead className="whitespace-nowrap">Municipio</TableHead>}
              {visibleColumns.village && <TableHead className="whitespace-nowrap">Aldea</TableHead>}
              {visibleColumns.program && <TableHead className="whitespace-nowrap">Programa</TableHead>}
              {visibleColumns.bag && <TableHead className="whitespace-nowrap">Cantidad de Bolsas</TableHead>}
              {visibleColumns.googleMaps && <TableHead className="whitespace-nowrap">Google Maps</TableHead>}
              {visibleColumns.status && <TableHead className="whitespace-nowrap">Estado</TableHead>}
              {visibleColumns.admissionDate && <TableHead className="whitespace-nowrap">Fecha Ingreso</TableHead>}
              <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
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
                  {visibleColumns.photo && (
                    <TableCell>
                      {beneficiary.photo_url ? (
                        <button
                          onClick={() => handleViewPhoto(beneficiary.photo_url!, beneficiary.name)}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer group"
                          title="Ver foto"
                        >
                          <Image
                            src={beneficiary.photo_url}
                            alt={`Foto de ${beneficiary.name}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center" title="Sin foto">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.name && <TableCell className="font-medium whitespace-nowrap">{beneficiary.name}</TableCell>}
                  {visibleColumns.ageGender && (
                    <TableCell className="whitespace-nowrap">
                      {beneficiary.age} años / {beneficiary.gender}
                    </TableCell>
                  )}
                  {visibleColumns.department && <TableCell className="whitespace-nowrap">{beneficiary.department}</TableCell>}
                  {visibleColumns.municipality && <TableCell className="whitespace-nowrap">{beneficiary.municipality}</TableCell>}
                  {visibleColumns.village && <TableCell className="whitespace-nowrap">{beneficiary.village || '-'}</TableCell>}
                  {visibleColumns.program && <TableCell className="whitespace-nowrap">{beneficiary.program}</TableCell>}
                  {visibleColumns.bag && <TableCell className="whitespace-nowrap">{beneficiary.bag || '-'}</TableCell>}
                  {visibleColumns.googleMaps && (
                    <TableCell>
                      {beneficiary.google_maps_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenMaps(beneficiary.google_maps_url!)}
                          className="gap-2 text-blue-600 hover:text-blue-700"
                          title="Abrir en Google Maps"
                        >
                          <MapPin className="w-4 h-4" />
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge className={beneficiary.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}>
                        {beneficiary.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.admissionDate && (
                    <TableCell className="whitespace-nowrap">
                      {new Date(beneficiary.admission_date).toLocaleDateString('es-GT')}
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap">
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


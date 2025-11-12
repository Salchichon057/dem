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
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { Beneficiary, } from '@/lib/types'
import { toast } from 'sonner'
import BeneficiaryForm from './beneficiary-form'

export default function BeneficiariesTable() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [allBeneficiaries, setAllBeneficiaries] = useState<Beneficiary[]>([]) // Para generar filtros dinámicos
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

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

      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lista de Beneficiarios</h2>
          <p className="text-muted-foreground">Total: {total} beneficiarios</p>
        </div>
        <Button className="gap-2" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          Agregar Beneficiario
        </Button>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Edad / Género</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Aldea</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Ingreso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : beneficiaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No se encontraron beneficiarios
                </TableCell>
              </TableRow>
            ) : (
              beneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id}>
                  <TableCell className="font-medium">{beneficiary.name}</TableCell>
                  <TableCell>
                    {beneficiary.age} años / {beneficiary.gender}
                  </TableCell>
                  <TableCell>{beneficiary.department}</TableCell>
                  <TableCell>{beneficiary.municipality}</TableCell>
                  <TableCell>{beneficiary.village || '-'}</TableCell>
                  <TableCell>{beneficiary.program}</TableCell>
                  <TableCell>
                    <Badge variant={beneficiary.is_active ? 'default' : 'secondary'}>
                      {beneficiary.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(beneficiary.admission_date).toLocaleDateString('es-GT')}
                  </TableCell>
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
    </div>
  )
}

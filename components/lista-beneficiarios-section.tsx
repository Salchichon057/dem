"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Heart, Calendar, Edit, Trash2, Eye, Phone, User } from "lucide-react"
import { toast } from "sonner"

interface Beneficiario {
  id: string
  nombre: string
  apellidos: string
  edad: number
  genero: "masculino" | "femenino" | "otro"
  telefono: string
  direccion: string
  comunidad: string
  fechaIngreso: string
  tipoApoyo: string[]
  estado: "activo" | "inactivo" | "graduado"
  responsable: string
  observaciones: string
  createdAt: string
  updatedAt: string
}

export function ListaBeneficiariosSection() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBeneficiario, setSelectedBeneficiario] = useState<Beneficiario | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    cargarBeneficiarios()
  }, [])

  const cargarBeneficiarios = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setBeneficiarios([
        {
          id: "1",
          nombre: "María Elena",
          apellidos: "González López",
          edad: 75,
          genero: "femenino",
          telefono: "5551-2345",
          direccion: "3era Calle 12-45, Zona 1",
          comunidad: "San José Poaquil",
          fechaIngreso: "2024-03-15",
          tipoApoyo: ["Alimentación", "Compañía", "Cuidado médico"],
          estado: "activo",
          responsable: "Ana Rodríguez",
          observaciones: "Requiere atención especial para diabetes",
          createdAt: "2024-03-15T10:00:00Z",
          updatedAt: "2025-01-10T14:30:00Z"
        },
        {
          id: "2",
          nombre: "José Manuel",
          apellidos: "Pérez Morales",
          edad: 82,
          genero: "masculino",
          telefono: "5552-6789",
          direccion: "Avenida Central 15-20",
          comunidad: "Villas del Quetzal",
          fechaIngreso: "2024-01-20",
          tipoApoyo: ["Alimentación", "Transporte", "Actividades recreativas"],
          estado: "activo",
          responsable: "Carlos Méndez",
          observaciones: "Participa activamente en actividades grupales",
          createdAt: "2024-01-20T09:15:00Z",
          updatedAt: "2025-01-05T16:45:00Z"
        },
        {
          id: "3",
          nombre: "Carmen Rosa",
          apellidos: "Herrera Vásquez",
          edad: 68,
          genero: "femenino",
          telefono: "5553-9876",
          direccion: "2da Avenida 8-12, Zona 3",
          comunidad: "San José Poaquil",
          fechaIngreso: "2023-11-10",
          tipoApoyo: ["Alimentación", "Compañía"],
          estado: "graduado",
          responsable: "María González",
          observaciones: "Completó programa exitosamente",
          createdAt: "2023-11-10T11:30:00Z",
          updatedAt: "2024-12-15T10:20:00Z"
        }
      ])
    } catch {
      toast.error('Error cargando beneficiarios')
    } finally {
      setLoading(false)
    }
  }

  const filteredBeneficiarios = beneficiarios.filter(beneficiario =>
    beneficiario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiario.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiario.comunidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiario.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-700'
      case 'inactivo':
        return 'bg-gray-100 text-gray-700'
      case 'graduado':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const calcularEdadPromedio = () => {
    if (beneficiarios.length === 0) return 0
    const suma = beneficiarios.reduce((acc, b) => acc + b.edad, 0)
    return Math.round(suma / beneficiarios.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando beneficiarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Beneficiarios</h1>
          <p className="text-gray-600">Gestiona los beneficiarios del programa Abrazando Leyendas</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Beneficiario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, comunidad o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Beneficiarios</p>
                <p className="text-2xl font-bold text-gray-900">{beneficiarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {beneficiarios.filter(b => b.estado === 'activo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Graduados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {beneficiarios.filter(b => b.estado === 'graduado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Edad Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{calcularEdadPromedio()} años</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficiarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiario</TableHead>
                  <TableHead>Edad/Género</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Comunidad</TableHead>
                  <TableHead>Tipo de Apoyo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeneficiarios.map((beneficiario) => (
                  <TableRow key={beneficiario.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{beneficiario.nombre} {beneficiario.apellidos}</p>
                        <p className="text-sm text-gray-600">Responsable: {beneficiario.responsable}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{beneficiario.edad} años</p>
                        <p className="text-sm text-gray-600 capitalize">{beneficiario.genero}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{beneficiario.telefono}</span>
                        </div>
                        <p className="text-sm text-gray-600">{beneficiario.direccion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{beneficiario.comunidad}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {beneficiario.tipoApoyo.slice(0, 2).map((tipo, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tipo}
                          </Badge>
                        ))}
                        {beneficiario.tipoApoyo.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{beneficiario.tipoApoyo.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadgeColor(beneficiario.estado)}>
                        {beneficiario.estado.charAt(0).toUpperCase() + beneficiario.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(beneficiario.fechaIngreso)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBeneficiario(beneficiario)
                            setShowDetailModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Beneficiario</DialogTitle>
          </DialogHeader>
          {selectedBeneficiario && (
            <div className="space-y-6">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                      <p className="text-gray-900">{selectedBeneficiario.nombre} {selectedBeneficiario.apellidos}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Edad</label>
                      <p className="text-gray-900">{selectedBeneficiario.edad} años</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Género</label>
                      <p className="text-gray-900 capitalize">{selectedBeneficiario.genero}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <Badge className={getEstadoBadgeColor(selectedBeneficiario.estado)}>
                        {selectedBeneficiario.estado.charAt(0).toUpperCase() + selectedBeneficiario.estado.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-gray-900">{selectedBeneficiario.telefono}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Comunidad</label>
                      <p className="text-gray-900">{selectedBeneficiario.comunidad}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Dirección</label>
                      <p className="text-gray-900">{selectedBeneficiario.direccion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Programa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Programa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Ingreso</label>
                      <p className="text-gray-900">{formatDate(selectedBeneficiario.fechaIngreso)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Responsable</label>
                      <p className="text-gray-900">{selectedBeneficiario.responsable}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Tipos de Apoyo</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedBeneficiario.tipoApoyo.map((tipo, index) => (
                          <Badge key={index} variant="outline">
                            {tipo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Observaciones</label>
                      <p className="text-gray-900">{selectedBeneficiario.observaciones}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

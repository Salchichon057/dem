"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FileText, Calendar, Edit, Trash2, Eye, User } from "lucide-react"
import { toast } from "sonner"

interface FormularioAuditoria {
  id: string
  nombre: string
  descripcion: string
  organizacion: string
  fechaCreacion: string
  estado: "activo" | "inactivo" | "revision"
  responsable: string
  campos: number
  respuestas: number
  createdAt: string
  updatedAt: string
}

export function FormulariosAuditoriaSection() {
  const [formularios, setFormularios] = useState<FormularioAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormulario, setSelectedFormulario] = useState<FormularioAuditoria | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    cargarFormularios()
  }, [])

  const cargarFormularios = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setFormularios([
        {
          id: "1",
          nombre: "Auditoría de Procesos Financieros",
          descripcion: "Formulario para auditar los procesos financieros de las organizaciones",
          organizacion: "Fundación Ruta de Alimentos",
          fechaCreacion: "2025-01-10",
          estado: "activo",
          responsable: "María González",
          campos: 25,
          respuestas: 15,
          createdAt: "2025-01-10T10:00:00Z",
          updatedAt: "2025-01-15T14:30:00Z"
        },
        {
          id: "2",
          nombre: "Evaluación de Impacto Comunitario",
          descripcion: "Formulario para evaluar el impacto de los programas en las comunidades",
          organizacion: "Programa Abrazando Leyendas",
          fechaCreacion: "2025-01-05",
          estado: "revision",
          responsable: "Carlos Méndez",
          campos: 30,
          respuestas: 8,
          createdAt: "2025-01-05T09:15:00Z",
          updatedAt: "2025-01-12T16:45:00Z"
        }
      ])
    } catch (error) {
      console.error('Error cargando formularios:', error)
      toast.error('Error cargando formularios de auditoría')
    } finally {
      setLoading(false)
    }
  }

  const filteredFormularios = formularios.filter(formulario =>
    formulario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formulario.organizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formulario.responsable.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'revision':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formularios de Auditoría</h1>
          <p className="text-gray-600">Gestiona los formularios de auditoría y evaluación</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Formulario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, organización o responsable..."
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
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Formularios</p>
                <p className="text-2xl font-bold text-gray-900">{formularios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formularios.filter(f => f.estado === 'activo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">En Revisión</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formularios.filter(f => f.estado === 'revision').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Respuestas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formularios.reduce((acc, f) => acc + f.respuestas, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Formularios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Organización</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Campos/Respuestas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormularios.map((formulario) => (
                  <TableRow key={formulario.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formulario.nombre}</p>
                        <p className="text-sm text-gray-600">{formulario.descripcion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formulario.organizacion}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{formulario.responsable}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(formulario.fechaCreacion)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadgeColor(formulario.estado)}>
                        {formulario.estado.charAt(0).toUpperCase() + formulario.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formulario.campos} campos</p>
                        <p className="text-purple-600">{formulario.respuestas} respuestas</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFormulario(formulario)
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Formulario</DialogTitle>
          </DialogHeader>
          {selectedFormulario && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900">{selectedFormulario.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <Badge className={getEstadoBadgeColor(selectedFormulario.estado)}>
                    {selectedFormulario.estado.charAt(0).toUpperCase() + selectedFormulario.estado.slice(1)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Organización</label>
                  <p className="text-gray-900">{selectedFormulario.organizacion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Responsable</label>
                  <p className="text-gray-900">{selectedFormulario.responsable}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Campos</label>
                  <p className="text-gray-900">{selectedFormulario.campos}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Respuestas</label>
                  <p className="text-gray-900">{selectedFormulario.respuestas}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Descripción</label>
                <p className="text-gray-900">{selectedFormulario.descripcion}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

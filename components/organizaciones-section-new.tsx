"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, MoreHorizontal, Building2, Users, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { obtenerOrganizaciones, crearOrganizacion, type Organizacion, type NuevaOrganizacion, manejarErrorApi } from "@/lib/api"

export function OrganizacionesSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewModal, setShowNewModal] = useState(false)
  const [organizacionesList, setOrganizacionesList] = useState<Organizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingOrg, setCreatingOrg] = useState(false)
  const [newOrgForm, setNewOrgForm] = useState<NuevaOrganizacion>({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    sitioWeb: ""
  })

  // Cargar organizaciones al montar el componente
  useEffect(() => {
    cargarOrganizaciones()
  }, [])

  const cargarOrganizaciones = async () => {
    try {
      setLoading(true)
      const organizaciones = await obtenerOrganizaciones()
      setOrganizacionesList(organizaciones)
    } catch (error) {
      toast.error(`Error cargando organizaciones: ${manejarErrorApi(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNewOrganization = () => {
    setShowNewModal(true)
  }

  const handleSubmitNewOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación básica
    if (!newOrgForm.nombre) {
      toast.error("El nombre de la organización es requerido")
      return
    }

    try {
      setCreatingOrg(true)
      const nuevaOrganizacion = await crearOrganizacion(newOrgForm)
      
      // Agregar a la lista local
      setOrganizacionesList(prev => [nuevaOrganizacion, ...prev])
      
      toast.success(`Organización "${nuevaOrganizacion.nombre}" creada exitosamente`)
      
      // Limpiar formulario y cerrar modal
      setNewOrgForm({
        nombre: "",
        descripcion: "",
        direccion: "",
        telefono: "",
        email: "",
        sitioWeb: ""
      })
      setShowNewModal(false)
    } catch (error) {
      toast.error(`Error creando organización: ${manejarErrorApi(error)}`)
    } finally {
      setCreatingOrg(false)
    }
  }

  const handleFormChange = (field: keyof NuevaOrganizacion, value: string) => {
    setNewOrgForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const filteredOrganizaciones = organizacionesList.filter(
    (org) =>
      org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.descripcion && org.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (org.email && org.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "ACTIVA":
        return <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 shadow-sm">✓ Activa</Badge>
      case "INACTIVA":
        return <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200 shadow-sm">⏸ Inactiva</Badge>
      case "SUSPENDIDA":
        return <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200 shadow-sm">🚫 Suspendida</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200 shadow-sm">? Desconocido</Badge>
    }
  }

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Mostrar loading mientras cargan los datos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando organizaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl font-bold">Gestión de Organizaciones</CardTitle>
                <CardDescription className="text-purple-100">
                  Administra y supervisa todas las organizaciones del sistema
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleNewOrganization}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Organización
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar organizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-purple-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100">
                  <TableHead className="font-semibold text-gray-700">Organización</TableHead>
                  <TableHead className="font-semibold text-gray-700">Descripción</TableHead>
                  <TableHead className="font-semibold text-gray-700">Miembros</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Fecha Creación</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizaciones.map((org, index) => (
                  <TableRow 
                    key={org.id} 
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 border-b border-purple-100/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {org.nombre.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{org.nombre}</div>
                          <div className="text-sm text-gray-500">{org.email || 'Sin email'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {org.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700">
                          {org.miembros?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(org.estado)}</TableCell>
                    <TableCell className="text-gray-600 font-medium">
                      {formatearFecha(org.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-gray-200">
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
                            👁️ Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50">
                            ✏️ Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50">
                            🚫 Desactivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para Nueva Organización */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Nueva Organización
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Completa los datos para crear una nueva organización en el sistema.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNewOrg} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre de la Organización *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Fundación Esperanza"
                  value={newOrgForm.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Breve descripción de la organización..."
                  value={newOrgForm.descripcion}
                  onChange={(e) => handleFormChange("descripcion", e.target.value)}
                  className="border-purple-200 focus:border-purple-400 min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    placeholder="+54 11 1234-5678"
                    value={newOrgForm.telefono}
                    onChange={(e) => handleFormChange("telefono", e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@organizacion.org"
                    value={newOrgForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  placeholder="Calle 123, Ciudad, País"
                  value={newOrgForm.direccion}
                  onChange={(e) => handleFormChange("direccion", e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitioWeb" className="text-sm font-medium text-gray-700">
                  Sitio Web
                </Label>
                <Input
                  id="sitioWeb"
                  placeholder="https://www.organizacion.org"
                  value={newOrgForm.sitioWeb}
                  onChange={(e) => handleFormChange("sitioWeb", e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewModal(false)}
                className="border-gray-300 hover:bg-gray-50"
                disabled={creatingOrg}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={creatingOrg}
              >
                {creatingOrg ? "Creando..." : "Crear Organización"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

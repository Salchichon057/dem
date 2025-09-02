"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, MoreHorizontal, Building2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { obtenerOrganizaciones, crearOrganizacion, type Organizacion, type NuevaOrganizacion, manejarErrorApi } from "@/lib/api"

export function OrganizacionesSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organizacion | null>(null)
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
      
      // Limpiar datos antes de enviar (remover strings vacíos)
      const datosLimpios = Object.fromEntries(
        Object.entries(newOrgForm).filter(([, value]) => value !== '')
      ) as NuevaOrganizacion
      
      const nuevaOrganizacion = await crearOrganizacion(datosLimpios)
      
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

  const handleViewDetails = (org: Organizacion) => {
    setSelectedOrg(org)
    setShowDetailsModal(true)
  }

  const filteredOrganizaciones = organizacionesList.filter(
    (org) =>
      org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.descripcion && org.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (org.email && org.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
                  <TableHead className="font-semibold text-gray-700">Nombre Comercial</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nombre Fiscal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Proyección Social</TableHead>
                  <TableHead className="font-semibold text-gray-700">Ubicación</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nombre Encargado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Correo Electrónico</TableHead>
                  <TableHead className="font-semibold text-gray-700">Número de Contacto</TableHead>
                  <TableHead className="font-semibold text-gray-700">Departamento</TableHead>
                  <TableHead className="font-semibold text-gray-700">Municipio</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Opciones</TableHead>
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
                      <div className="font-semibold text-gray-900">
                        {org.nombreComercial || org.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.nombreFiscal || 'No especificado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {org.proyeccionSocial || 'No especificada'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.ubicacion || 'No especificada'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.nombreEncargado || 'No especificado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.correoElectronico || org.email || 'No especificado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.numeroContacto || org.telefono || 'No especificado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.departamento || 'No especificado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {org.municipio || 'No especificado'}
                      </div>
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
                          <DropdownMenuItem 
                            onClick={() => handleViewDetails(org)}
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer"
                          >
                            👁️ Ver detalles completos
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer">
                            ✏️ Editar organización
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 cursor-pointer">
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

      {/* Modal para Ver Detalles Completos */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Detalles Completos de la Organización
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Información detallada de {selectedOrg?.nombre || 'la organización seleccionada'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrg && (
            <div className="space-y-6 py-4">
              {/* Información General */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  Información General
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nombre Completo de la Organización</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.nombreCompletoOrg || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">¿A qué se dedica la organización?</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.dedicacionOrg || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Clasificación</Label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{selectedOrg.clasificacion || 'No especificada'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Estatus</Label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{selectedOrg.estatus || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  Ubicación
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Departamento</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.departamento || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Municipio</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.municipio || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Zona</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.zona || 'No especificada'}</p>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-sm font-medium text-gray-700">Dirección</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.direccion || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Contactos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Contacto Principal - Nombre</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.nombreContactoPrincipal || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cargo del Contacto Principal</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.cargoContactoPrincipal || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Teléfono del Contacto Principal</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.telefonoContactoPrincipal || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Correo del Contacto Principal</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.correoContactoPrincipal || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Poblaciones Atendidas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  Poblaciones Atendidas
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Población Total DEM</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.poblacionTotalDEM || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Primera Infancia (M)</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.primeraInfanciaMujeres || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Primera Infancia (H)</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.primeraInfanciaHombres || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Familias Atendidas</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.familiasAtendidas || 0}</p>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800 border-b border-purple-200 pb-2">
                  Información Adicional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo de Labor Social</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.tipoLaborSocial || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo de Financiamiento</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.tipoFinanciamiento || 'No especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Página Web/Redes Sociales</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.paginaWeb || 'No especificada'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">NIT</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrg.nit || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowDetailsModal(false)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

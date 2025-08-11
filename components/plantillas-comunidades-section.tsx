"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Plus, Search, Eye, Edit2, Trash2, Copy } from "lucide-react"
import { manejarErrorApi } from "@/lib/api"

// Tipos temporales para plantillas
interface PlantillaComunidad {
  id: string
  nombre: string
  descripcion?: string
  categoria?: string
  contenido?: string
  campos?: string
  createdAt: string
}

interface NuevaPlantilla {
  nombre: string
  descripcion: string
  categoria: string
  contenido: string
  campos: string
}

// Funciones temporales (deben ser implementadas en el API)
const obtenerPlantillasComunidades = async (): Promise<PlantillaComunidad[]> => {
  // TODO: Implementar en el API real
  return []
}

const crearPlantillaComunidad = async (data: NuevaPlantilla): Promise<PlantillaComunidad> => {
  // TODO: Implementar en el API real
  console.log('Creando plantilla:', data)
  return { id: '1', nombre: data.nombre, createdAt: new Date().toISOString() }
}
import { toast } from "sonner"

export function PlantillasComunidadesSection() {
  const [plantillas, setPlantillas] = useState<PlantillaComunidad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewModal, setShowNewModal] = useState(false)
  const [creatingTemplate, setCreatingTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaComunidad | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    contenido: "",
    campos: ""
  })

  useEffect(() => {
    cargarPlantillas()
  }, [])

  const cargarPlantillas = async () => {
    try {
      setLoading(true)
      const data = await obtenerPlantillasComunidades()
      setPlantillas(data)
    } catch (error) {
      toast.error(`Error cargando plantillas: ${manejarErrorApi(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.descripcion) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    try {
      setCreatingTemplate(true)
      await crearPlantillaComunidad(formData)
      toast.success("Plantilla creada exitosamente")
      setShowNewModal(false)
      resetForm()
      cargarPlantillas()
    } catch (error) {
      toast.error(`Error creando plantilla: ${manejarErrorApi(error)}`)
    } finally {
      setCreatingTemplate(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      contenido: "",
      campos: ""
    })
  }

  const copiarPlantilla = async (plantilla: PlantillaComunidad) => {
    try {
      await navigator.clipboard.writeText(plantilla.contenido || '')
      toast.success("Contenido copiado al portapapeles")
    } catch {
      toast.error("Error copiando al portapapeles")
    }
  }

  const filteredPlantillas = plantillas.filter(
    (plantilla) =>
      plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plantilla.descripcion && plantilla.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (plantilla.categoria && plantilla.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando plantillas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plantillas de Comunidades</h2>
          <p className="text-gray-600">Gestiona plantillas para formularios y documentos comunitarios</p>
        </div>
        
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
              <DialogDescription>
                Crea una plantilla reutilizable para formularios comunitarios
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={manejarSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Plantilla *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Formulario de Inscripción"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Describe el propósito de esta plantilla"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="Ej: Inscripción, Evaluación, Seguimiento"
                />
              </div>

              <div>
                <Label htmlFor="contenido">Contenido de la Plantilla</Label>
                <Textarea
                  id="contenido"
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  placeholder="Contenido HTML o texto de la plantilla"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="campos">Campos (JSON)</Label>
                <Textarea
                  id="campos"
                  value={formData.campos}
                  onChange={(e) => setFormData({...formData, campos: e.target.value})}
                  placeholder='{"campo1": "tipo", "campo2": "tipo"}'
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNewModal(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={creatingTemplate}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {creatingTemplate ? "Creando..." : "Crear Plantilla"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Plantillas */}
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Plantillas Disponibles
          </CardTitle>
          <CardDescription className="text-purple-100">
            {filteredPlantillas.length} plantilla(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Nombre</TableHead>
                  <TableHead className="font-semibold text-gray-700">Categoría</TableHead>
                  <TableHead className="font-semibold text-gray-700">Descripción</TableHead>
                  <TableHead className="font-semibold text-gray-700">Fecha Creación</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlantillas.map((plantilla) => (
                  <TableRow key={plantilla.id} className="hover:bg-purple-50/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        {plantilla.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      {plantilla.categoria && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {plantilla.categoria}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {plantilla.descripcion}
                    </TableCell>
                    <TableCell>
                      {new Date(plantilla.createdAt).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(plantilla)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copiarPlantilla(plantilla)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

          {filteredPlantillas.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron plantillas' : 'No hay plantillas disponibles'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza creando tu primera plantilla para formularios comunitarios'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowNewModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Plantilla
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Vista Previa */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {selectedTemplate.nombre}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate.descripcion}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Metadatos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información de la Plantilla</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Categoría</Label>
                    <p className="mt-1">{selectedTemplate.categoria || 'Sin categoría'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fecha de Creación</Label>
                    <p className="mt-1">{new Date(selectedTemplate.createdAt).toLocaleDateString('es-ES')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contenido */}
              {selectedTemplate.contenido && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contenido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.contenido}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Campos */}
              {selectedTemplate.campos && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campos Definidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.campos}</pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acciones */}
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => copiarPlantilla(selectedTemplate)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Contenido
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Plantilla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MapPin, Users, Phone, Calendar, Edit, Trash2, Eye } from "lucide-react"
import { obtenerComunidades, eliminarComunidad, type Comunidad, manejarErrorApi } from "@/lib/api"
import { toast } from "sonner"

export function ListaComunidadesSection() {
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedComunidad, setSelectedComunidad] = useState<Comunidad | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    cargarComunidades()
  }, [])

  const cargarComunidades = async () => {
    try {
      setLoading(true)
      const data = await obtenerComunidades()
      setComunidades(data)
    } catch (error) {
      toast.error(`Error cargando comunidades: ${manejarErrorApi(error)}`)
      // Datos de ejemplo para desarrollo
      setComunidades([
        {
          id: "1",
          fechaInscripcion: "2025-01-17",
          departamento: "Chimaltenango",
          municipio: "San José Poaquil",
          aldeas: "Aldea Haciendo a Vieja",
          caseriosAtienden: ["Hacienda vieja", "Panama"],
          qtyCaserios: 2,
          ubicacionGoogleMaps: "14.123456, -90.654321",
          lider: "Reyna Nohelia Sirin Chan",
          numeroLider: "4600 7627",
          asistenteGrupoLideres: "Sí",
          comiteComunitario: "Activo",
          activa: true,
          cantidadFamilias: 400,
          cantidadFamRA: 50,
          primeraInfanciaMujeres: 15,
          primeraInfanciaHombres: 18,
          ninez3a5Mujeres: 25,
          ninez3a5Hombres: 22,
          jovenes6a10Mujeres: 30,
          jovenes6a10Hombres: 28,
          adultos11a18Mujeres: 35,
          adultos11a18Hombres: 33,
          adultos19a60Mujeres: 45,
          adultos19a60Hombres: 42,
          adultoMayor61Mujeres: 8,
          adultoMayor61Hombres: 6,
          mujeresGestantes: 5,
          mujeresLactantes: 3,
          clasificacion: "GRANDE",
          capacidadAlmacenamiento: "500 bolsas",
          formasColocacionInteres: ["BS", "BA", "C"],
          tipoColocacion: "Mensual",
          grupoWhatsapp: "Sí",
          book: "Sí",
          bolsasMaximo: 100,
          bolsasCortesia: 10,
          createdAt: "2025-01-17T19:02:18Z",
          updatedAt: "2025-01-17T19:02:18Z"
        },
        {
          id: "2",
          fechaInscripcion: "2025-03-03",
          departamento: "Guatemala",
          municipio: "San Juan Sacatepéquez",
          aldeas: "Villas del Quetzal",
          caseriosAtienden: ["Colonia La Gotica", "Condados", "La Cienega"],
          qtyCaserios: 19,
          ubicacionGoogleMaps: "14.567890, -90.123456",
          lider: "Jefherson Isai Méndez Garcia",
          numeroLider: "3842 5977",
          asistenteGrupoLideres: "Sí",
          comiteComunitario: "Activo",
          activa: true,
          cantidadFamilias: 6,
          cantidadFamRA: 268,
          primeraInfanciaMujeres: 20,
          primeraInfanciaHombres: 25,
          ninez3a5Mujeres: 30,
          ninez3a5Hombres: 28,
          jovenes6a10Mujeres: 40,
          jovenes6a10Hombres: 38,
          adultos11a18Mujeres: 50,
          adultos11a18Hombres: 48,
          adultos19a60Mujeres: 60,
          adultos19a60Hombres: 55,
          adultoMayor61Mujeres: 12,
          adultoMayor61Hombres: 10,
          mujeresGestantes: 8,
          mujeresLactantes: 6,
          clasificacion: "GRANDE",
          capacidadAlmacenamiento: "800 bolsas",
          formasColocacionInteres: ["BS", "C", "B"],
          tipoColocacion: "Mensual",
          grupoWhatsapp: "Sí",
          book: "Sí",
          bolsasMaximo: 300,
          bolsasCortesia: 25,
          createdAt: "2025-03-03T14:40:41Z",
          updatedAt: "2025-03-03T14:40:41Z"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta comunidad?')) return
    
    try {
      await eliminarComunidad(id)
      setComunidades(prev => prev.filter(c => c.id !== id))
      toast.success('Comunidad eliminada exitosamente')
    } catch (error) {
      toast.error(`Error eliminando comunidad: ${manejarErrorApi(error)}`)
    }
  }

  const filteredComunidades = comunidades.filter(comunidad =>
    comunidad.lider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comunidad.aldeas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comunidad.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comunidad.municipio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getTotalPoblacion = (comunidad: Comunidad) => {
    return comunidad.primeraInfanciaMujeres + comunidad.primeraInfanciaHombres +
           comunidad.ninez3a5Mujeres + comunidad.ninez3a5Hombres +
           comunidad.jovenes6a10Mujeres + comunidad.jovenes6a10Hombres +
           comunidad.adultos11a18Mujeres + comunidad.adultos11a18Hombres +
           comunidad.adultos19a60Mujeres + comunidad.adultos19a60Hombres +
           comunidad.adultoMayor61Mujeres + comunidad.adultoMayor61Hombres
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comunidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Comunidades</h1>
          <p className="text-gray-600">Gestiona las comunidades del programa Ruta de Alimentos</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Comunidad
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por líder, aldea, departamento o municipio..."
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
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Comunidades</p>
                <p className="text-2xl font-bold text-gray-900">{comunidades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comunidades.filter(c => c.activa).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Familias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comunidades.reduce((acc, c) => acc + c.cantidadFamilias, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Familias en RA</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comunidades.reduce((acc, c) => acc + c.cantidadFamRA, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comunidades Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Inscripción</TableHead>
                  <TableHead>Líder/Número</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Caseríos</TableHead>
                  <TableHead>Familias</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Clasificación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComunidades.map((comunidad) => (
                  <TableRow key={comunidad.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(comunidad.fechaInscripcion)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comunidad.lider}</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{comunidad.numeroLider}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comunidad.aldeas}</p>
                        <p className="text-sm text-gray-600">
                          {comunidad.municipio}, {comunidad.departamento}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {comunidad.qtyCaserios} caseríos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comunidad.cantidadFamilias} total</p>
                        <p className="text-sm text-purple-600">{comunidad.cantidadFamRA} en RA</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={comunidad.activa ? "default" : "secondary"}
                        className={comunidad.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                      >
                        {comunidad.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          comunidad.clasificacion === 'GRANDE' ? "border-red-200 text-red-700" :
                          comunidad.clasificacion === 'MEDIANA' ? "border-yellow-200 text-yellow-700" :
                          "border-green-200 text-green-700"
                        }
                      >
                        {comunidad.clasificacion}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComunidad(comunidad)
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
                          onClick={() => handleEliminar(comunidad.id)}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Comunidad</DialogTitle>
          </DialogHeader>
          {selectedComunidad && (
            <div className="space-y-6">
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Inscripción</label>
                      <p className="text-gray-900">{formatDate(selectedComunidad.fechaInscripcion)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Líder Comunitario</label>
                      <p className="text-gray-900">{selectedComunidad.lider}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número de Contacto</label>
                      <p className="text-gray-900">{selectedComunidad.numeroLider}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <Badge className={selectedComunidad.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {selectedComunidad.activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Departamento</label>
                      <p className="text-gray-900">{selectedComunidad.departamento}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Municipio</label>
                      <p className="text-gray-900">{selectedComunidad.municipio}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Aldeas</label>
                      <p className="text-gray-900">{selectedComunidad.aldeas}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Caseríos que Atienden</label>
                      <p className="text-gray-900">{selectedComunidad.caseriosAtienden.join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demografía */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Demográfica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Familias</label>
                      <p className="text-xl font-bold text-gray-900">{selectedComunidad.cantidadFamilias}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Familias en RA</label>
                      <p className="text-xl font-bold text-purple-600">{selectedComunidad.cantidadFamRA}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Población Total</label>
                      <p className="text-xl font-bold text-blue-600">{getTotalPoblacion(selectedComunidad)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Clasificación</label>
                      <Badge className={
                        selectedComunidad.clasificacion === 'GRANDE' ? "bg-red-100 text-red-700" :
                        selectedComunidad.clasificacion === 'MEDIANA' ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }>
                        {selectedComunidad.clasificacion}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Distribución por Edad y Género</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Primera Infancia (0-2)</p>
                        <p>Mujeres: {selectedComunidad.primeraInfanciaMujeres}</p>
                        <p>Hombres: {selectedComunidad.primeraInfanciaHombres}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Niñez (3-5)</p>
                        <p>Mujeres: {selectedComunidad.ninez3a5Mujeres}</p>
                        <p>Hombres: {selectedComunidad.ninez3a5Hombres}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Jóvenes (6-10)</p>
                        <p>Mujeres: {selectedComunidad.jovenes6a10Mujeres}</p>
                        <p>Hombres: {selectedComunidad.jovenes6a10Hombres}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Adolescentes (11-18)</p>
                        <p>Mujeres: {selectedComunidad.adultos11a18Mujeres}</p>
                        <p>Hombres: {selectedComunidad.adultos11a18Hombres}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Adultos (19-60)</p>
                        <p>Mujeres: {selectedComunidad.adultos19a60Mujeres}</p>
                        <p>Hombres: {selectedComunidad.adultos19a60Hombres}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Adulto Mayor (61+)</p>
                        <p>Mujeres: {selectedComunidad.adultoMayor61Mujeres}</p>
                        <p>Hombres: {selectedComunidad.adultoMayor61Hombres}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Condiciones Especiales</p>
                        <p>Gestantes: {selectedComunidad.mujeresGestantes}</p>
                        <p>Lactantes: {selectedComunidad.mujeresLactantes}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Operativa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Operativa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Capacidad de Almacenamiento</label>
                      <p className="text-gray-900">{selectedComunidad.capacidadAlmacenamiento}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Formas de Colocación</label>
                      <p className="text-gray-900">{selectedComunidad.formasColocacionInteres.join(", ")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bolsas Máximo</label>
                      <p className="text-gray-900">{selectedComunidad.bolsasMaximo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Bolsas de Cortesía</label>
                      <p className="text-gray-900">{selectedComunidad.bolsasCortesia}</p>
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

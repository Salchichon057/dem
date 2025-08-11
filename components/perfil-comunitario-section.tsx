"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Users, Phone, FileText, Plus } from "lucide-react"
import { obtenerPerfilesComunidades, crearPerfilComunidad, type PerfilComunidad, type NuevoPerfilComunidad, manejarErrorApi } from "@/lib/api"
import { toast } from "sonner"

export function PerfilComunitarioSection() {
  const [perfiles, setPerfiles] = useState<PerfilComunidad[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<PerfilComunidad | null>(null)
  const [formData, setFormData] = useState<NuevoPerfilComunidad>({
    fecha: "",
    nombreLider: "",
    telefonoLider: "",
    ubicacionWhatsApp: "",
    direccionExacta: "",
    departamento: "",
    municipio: "",
    beneficiaOtrasComunidades: "",
    actividadEconomica: "",
    tiposCultivos: "",
    poblacionGeneral: 0,
    familiasInscritas: 0,
    etniaMyoritaria: "",
    accesoAgua: "",
    origenAgua: "",
    tratamientoAgua: "",
    escuelaCercana: "",
    distanciaEscuela: "",
    puestoSaludCercano: "",
    distanciaPuestoSalud: "",
    frecuenciaVisitas: "",
    semanaEntrega: "",
    espacioFisicoAmplio: "",
    bazarMovil: "",
    bazarAgricola: "",
    voluntariado: "",
    talleresComunidad: "",
    temasTalleres: "",
    transporteGrande: "",
    contactosAntiguos: "",
    contactosComite: ""
  })

  useEffect(() => {
    cargarPerfiles()
  }, [])

  const cargarPerfiles = async () => {
    try {
      setLoading(true)
      const data = await obtenerPerfilesComunidades()
      setPerfiles(data)
    } catch (error) {
      toast.error(`Error cargando perfiles: ${manejarErrorApi(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombreLider || !formData.telefonoLider || !formData.departamento) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    try {
      setCreatingProfile(true)
      await crearPerfilComunidad(formData)
      toast.success("Perfil comunitario creado exitosamente")
      setShowFormModal(false)
      resetForm()
      cargarPerfiles()
    } catch (error) {
      toast.error(`Error creando perfil: ${manejarErrorApi(error)}`)
    } finally {
      setCreatingProfile(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fecha: "",
      nombreLider: "",
      telefonoLider: "",
      ubicacionWhatsApp: "",
      direccionExacta: "",
      departamento: "",
      municipio: "",
      beneficiaOtrasComunidades: "",
      actividadEconomica: "",
      tiposCultivos: "",
      poblacionGeneral: 0,
      familiasInscritas: 0,
      etniaMyoritaria: "",
      accesoAgua: "",
      origenAgua: "",
      tratamientoAgua: "",
      escuelaCercana: "",
      distanciaEscuela: "",
      puestoSaludCercano: "",
      distanciaPuestoSalud: "",
      frecuenciaVisitas: "",
      semanaEntrega: "",
      espacioFisicoAmplio: "",
      bazarMovil: "",
      bazarAgricola: "",
      voluntariado: "",
      talleresComunidad: "",
      temasTalleres: "",
      transporteGrande: "",
      contactosAntiguos: "",
      contactosComite: ""
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfiles comunitarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Perfil Comunitario</h2>
          <p className="text-gray-600">Formularios de inscripción y datos comunitarios</p>
        </div>
        
        <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Formulario de Inscripción Programa Ruta de Alimentos
              </DialogTitle>
              <DialogDescription>
                Programa que busca atender directamente a las comunidades a través del apoyo de instituciones o líderes comunitarios ya organizados.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={manejarSubmit} className="space-y-6">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Básica del Líder</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombreLider">Nombre completo del líder / presidente comunitario *</Label>
                    <Input
                      id="nombreLider"
                      value={formData.nombreLider}
                      onChange={(e) => setFormData({...formData, nombreLider: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefonoLider">Número de Teléfono del líder *</Label>
                    <Input
                      id="telefonoLider"
                      value={formData.telefonoLider}
                      onChange={(e) => setFormData({...formData, telefonoLider: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ubicacionWhatsApp">Ubicación por WhatsApp</Label>
                    <Select value={formData.ubicacionWhatsApp} onValueChange={(value) => setFormData({...formData, ubicacionWhatsApp: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ubicación de la Comunidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="direccionExacta">Dirección exacta de la Comunidad</Label>
                    <Textarea
                      id="direccionExacta"
                      value={formData.direccionExacta}
                      onChange={(e) => setFormData({...formData, direccionExacta: e.target.value})}
                      placeholder="Departamento, municipio, aldea, caserío, cantón, avenida, colonia, calle, etc"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="departamento">Departamento *</Label>
                      <Select value={formData.departamento} onValueChange={(value) => setFormData({...formData, departamento: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12 - Chimaltenango">12 - Chimaltenango</SelectItem>
                          <SelectItem value="13 - Sacatepéquez">13 - Sacatepéquez</SelectItem>
                          <SelectItem value="14 - Guatemala">14 - Guatemala</SelectItem>
                          <SelectItem value="15 - Escuintla">15 - Escuintla</SelectItem>
                          <SelectItem value="16 - Santa Rosa">16 - Santa Rosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="municipio">Municipio</Label>
                      <Input
                        id="municipio"
                        value={formData.municipio}
                        onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="beneficiaOtrasComunidades">¿Beneficiará a otras comunidades cercanas?</Label>
                    <Textarea
                      id="beneficiaOtrasComunidades"
                      value={formData.beneficiaOtrasComunidades}
                      onChange={(e) => setFormData({...formData, beneficiaOtrasComunidades: e.target.value})}
                      placeholder="Si la respuesta es SÍ, colocar qué comunidades"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información Socioeconómica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Socioeconómica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actividadEconomica">Actividad económica predominante</Label>
                    <Input
                      id="actividadEconomica"
                      value={formData.actividadEconomica}
                      onChange={(e) => setFormData({...formData, actividadEconomica: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiposCultivos">Tipos de cultivos o productos</Label>
                    <Input
                      id="tiposCultivos"
                      value={formData.tiposCultivos}
                      onChange={(e) => setFormData({...formData, tiposCultivos: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="poblacionGeneral">Población general de la comunidad</Label>
                    <Input
                      id="poblacionGeneral"
                      type="number"
                      value={formData.poblacionGeneral}
                      onChange={(e) => setFormData({...formData, poblacionGeneral: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="familiasInscritas">Familias inscritas en el programa</Label>
                    <Input
                      id="familiasInscritas"
                      type="number"
                      value={formData.familiasInscritas}
                      onChange={(e) => setFormData({...formData, familiasInscritas: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etniaMyoritaria">Etnia mayoritaria</Label>
                    <Select value={formData.etniaMyoritaria} onValueChange={(value) => setFormData({...formData, etniaMyoritaria: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maya">Maya</SelectItem>
                        <SelectItem value="Ladino">Ladino</SelectItem>
                        <SelectItem value="Garífuna">Garífuna</SelectItem>
                        <SelectItem value="Xinka">Xinka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Servicios Básicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Servicios Básicos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accesoAgua">¿Tienen acceso al agua?</Label>
                    <Select value={formData.accesoAgua} onValueChange={(value) => setFormData({...formData, accesoAgua: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="origenAgua">¿De dónde obtienen el agua?</Label>
                    <Select value={formData.origenAgua} onValueChange={(value) => setFormData({...formData, origenAgua: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tubería">Tubería</SelectItem>
                        <SelectItem value="Pozos comunitarios">Pozos comunitarios</SelectItem>
                        <SelectItem value="Cisterna">Cisterna</SelectItem>
                        <SelectItem value="Chorro dentro de la vivienda">Chorro dentro de la vivienda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tratamientoAgua">¿Qué tratamiento le dan al agua?</Label>
                    <Select value={formData.tratamientoAgua} onValueChange={(value) => setFormData({...formData, tratamientoAgua: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ninguno">Ninguno</SelectItem>
                        <SelectItem value="Filtrado">Filtrado</SelectItem>
                        <SelectItem value="Clorado">Clorado</SelectItem>
                        <SelectItem value="Hervido">Hervido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="escuelaCercana">¿Escuela pública cercana?</Label>
                    <Select value={formData.escuelaCercana} onValueChange={(value) => setFormData({...formData, escuelaCercana: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="distanciaEscuela">Distancia a la escuela (caminando)</Label>
                    <Select value={formData.distanciaEscuela} onValueChange={(value) => setFormData({...formData, distanciaEscuela: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="< 5 minutos">Menos de 5 minutos</SelectItem>
                        <SelectItem value="5 minutos">5 minutos</SelectItem>
                        <SelectItem value="15 minutos">15 minutos</SelectItem>
                        <SelectItem value="> 30 minutos">Más de 30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="puestoSaludCercano">¿Puesto de salud cercano?</Label>
                    <Select value={formData.puestoSaludCercano} onValueChange={(value) => setFormData({...formData, puestoSaludCercano: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="distanciaPuestoSalud">Distancia al puesto de salud (caminando)</Label>
                    <Select value={formData.distanciaPuestoSalud} onValueChange={(value) => setFormData({...formData, distanciaPuestoSalud: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="< 5 minutos">Menos de 5 minutos</SelectItem>
                        <SelectItem value="5 minutos">5 minutos</SelectItem>
                        <SelectItem value="15 minutos">15 minutos</SelectItem>
                        <SelectItem value="> 30 minutos">Más de 30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Programa y Entregas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Programa y Entregas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frecuenciaVisitas">Frecuencia de visitas para entrega</Label>
                    <Select value={formData.frecuenciaVisitas} onValueChange={(value) => setFormData({...formData, frecuenciaVisitas: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 vez al mes">1 vez al mes</SelectItem>
                        <SelectItem value="2 veces al mes">2 veces al mes</SelectItem>
                        <SelectItem value="3 veces al mes">3 veces al mes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semanaEntrega">Semana del mes para entrega</Label>
                    <Select value={formData.semanaEntrega} onValueChange={(value) => setFormData({...formData, semanaEntrega: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semana 1">Semana 1</SelectItem>
                        <SelectItem value="Semana 2">Semana 2</SelectItem>
                        <SelectItem value="Semana 3">Semana 3</SelectItem>
                        <SelectItem value="Semana 4">Semana 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="espacioFisicoAmplio">¿Espacio físico amplio para entrega?</Label>
                    <Select value={formData.espacioFisicoAmplio} onValueChange={(value) => setFormData({...formData, espacioFisicoAmplio: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bazarMovil">¿Les gustaría bazar móvil?</Label>
                    <Select value={formData.bazarMovil} onValueChange={(value) => setFormData({...formData, bazarMovil: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bazarAgricola">¿Les gustaría bazar agrícola?</Label>
                    <Select value={formData.bazarAgricola} onValueChange={(value) => setFormData({...formData, bazarAgricola: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Quisiera mas información">Quisiera más información</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Participación Comunitaria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participación Comunitaria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="voluntariado">¿Les gustaría hacer voluntariado?</Label>
                    <Select value={formData.voluntariado} onValueChange={(value) => setFormData({...formData, voluntariado: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Quisiera mas información">Quisiera más información</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="talleresComunidad">¿Les gustaría talleres comunitarios?</Label>
                    <Select value={formData.talleresComunidad} onValueChange={(value) => setFormData({...formData, talleresComunidad: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="temasTalleres">Temas para talleres comunitarios</Label>
                    <Textarea
                      id="temasTalleres"
                      value={formData.temasTalleres}
                      onChange={(e) => setFormData({...formData, temasTalleres: e.target.value})}
                      placeholder="Especificar temas de interés"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transporteGrande">¿Pueden gestionar transporte grande?</Label>
                    <Select value={formData.transporteGrande} onValueChange={(value) => setFormData({...formData, transporteGrande: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Contactos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contactos del Comité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contactosAntiguos">Contactos comunidad antigua (si aplica)</Label>
                    <Textarea
                      id="contactosAntiguos"
                      value={formData.contactosAntiguos}
                      onChange={(e) => setFormData({...formData, contactosAntiguos: e.target.value})}
                      placeholder="3 contactos para comunicación"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactosComite">Contactos del comité comunitario</Label>
                    <Textarea
                      id="contactosComite"
                      value={formData.contactosComite}
                      onChange={(e) => setFormData({...formData, contactosComite: e.target.value})}
                      placeholder="Presidente, Secretario, Tesorero y Vocal I con sus números de teléfono"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones */}
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowFormModal(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={creatingProfile}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {creatingProfile ? "Guardando..." : "Guardar Perfil"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Perfiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {perfiles.map((perfil) => (
          <Card key={perfil.id} className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                {perfil.nombreLider}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {perfil.departamento} - {perfil.municipio}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {perfil.telefonoLider}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {new Date(perfil.fecha).toLocaleDateString('es-ES')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                {perfil.familiasInscritas} familias inscritas
              </div>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedProfile(perfil)}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {perfiles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay perfiles comunitarios</h3>
            <p className="text-gray-600 mb-4">Comienza creando el primer perfil de la comunidad.</p>
            <Button 
              onClick={() => setShowFormModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Perfil
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalles */}
      {selectedProfile && (
        <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Perfil Comunitario - {selectedProfile.nombreLider}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Información básica */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fecha</Label>
                    <p className="mt-1">{new Date(selectedProfile.fecha).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
                    <p className="mt-1">{selectedProfile.telefonoLider}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Departamento</Label>
                    <p className="mt-1">{selectedProfile.departamento}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Municipio</Label>
                    <p className="mt-1">{selectedProfile.municipio}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información demográfica */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Demográfica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Población General</Label>
                    <p className="mt-1">{selectedProfile.poblacionGeneral?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Familias Inscritas</Label>
                    <p className="mt-1">{selectedProfile.familiasInscritas}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Etnia Mayoritaria</Label>
                    <p className="mt-1">{selectedProfile.etniaMyoritaria}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Actividad Económica</Label>
                    <p className="mt-1">{selectedProfile.actividadEconomica}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Servicios básicos */}
              <Card>
                <CardHeader>
                  <CardTitle>Servicios Básicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Acceso al Agua</Label>
                      <p className="mt-1">{selectedProfile.accesoAgua}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Origen del Agua</Label>
                      <p className="mt-1">{selectedProfile.origenAgua}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tratamiento del Agua</Label>
                      <p className="mt-1">{selectedProfile.tratamientoAgua}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Escuela Cercana</Label>
                      <p className="mt-1">{selectedProfile.escuelaCercana} - {selectedProfile.distanciaEscuela}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Puesto de Salud</Label>
                      <p className="mt-1">{selectedProfile.puestoSaludCercano} - {selectedProfile.distanciaPuestoSalud}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contactos del Comité */}
              {selectedProfile.contactosComite && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contactos del Comité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">{selectedProfile.contactosComite}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

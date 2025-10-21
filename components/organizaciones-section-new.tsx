'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Organizacion {
  id: string
  nombre: string
  nombreCompleto?: string
  descripcion?: string
  logo?: string
  estado: string
  ubicacionGoogleMaps?: string
  clasificacion?: string
  productosConsumen?: string
  capacidadAlmacenamiento?: string
  contacto1Nombre?: string
  contacto1Telefono?: string
  contacto1Email?: string
  departamento?: string
  municipio?: string
  tipoLaborSocial?: string
  poblacionTotalDEM?: number
  nit?: string
  createdAt?: string
}

export default function OrganizacionesSectionNew() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organizacion | null>(null)
  const [busqueda, setBusqueda] = useState('')
  
  const [formData, setFormData] = useState({
    // Información básica
    nombreCompleto: '',
    descripcion: '',
    ubicacionGoogleMaps: '',
    clasificacion: '',
    estado: 'ACTIVA',
    productosConsumen: '',
    capacidadAlmacenamiento: '',
    visitaInstitucional: '',
    categorizacion: '',
    personasAutorizadas: '',
    
    // Contacto principal 1
    contacto1Nombre: '',
    contacto1Cargo: '',
    contacto1Telefono: '',
    contacto1Email: '',
    
    // Contacto principal 2
    contacto2Nombre: '',
    contacto2Telefono: '',
    contacto2Email: '',
    
    // Ubicación principal
    departamento: '',
    municipio: '',
    zona: '',
    direccionDetallada: '',
    telefono: '',
    
    // Ubicación 2
    departamento2: '',
    municipio2: '',
    zona2: '',
    direccion2: '',
    
    // Ubicación 3
    departamento3: '',
    municipio3: '',
    zona3: '',
    direccion3: '',
    
    // Información institucional
    tipoLaborSocial: '',
    tipoFinanciamiento: '',
    tiposProgramas: '',
    paginaSocial: '',
    logo: '',
    
    // Beneficiarios
    rangoEdad: '',
    poblacionTotalDEM: 0,
    poblacionTotalBeneficiada: 0,
    
    // Demografía
    primeraInfanciaMujeres: 0,
    primeraInfanciaHombres: 0,
    ninezMujeres: 0,
    ninezHombres: 0,
    jovenesMujeres: 0,
    jovenesHombres: 0,
    adultosMujeres: 0,
    adultosHombres: 0,
    adultosMayoresMujeres: 0,
    adultosMayoresHombres: 0,
    
    familiasAtendidas: 0,
    ninasMadres: 0,
    ninasLactantes: 0,
    personasFemenino: 0,
    personasMasculino: 0,
    
    // Cobertura
    departamentosAtendidos: '',
    municipiosAtendidos: '',
    
    // Legal
    nit: '',
    nombreLegal: ''
  })

  useEffect(() => {
    cargarOrganizaciones()
  }, [])

  const cargarOrganizaciones = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/organizaciones')
      if (!response.ok) throw new Error('Error al cargar organizaciones')
      
      const data = await response.json()
      setOrganizaciones(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar organizaciones')
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (org?: Organizacion) => {
    if (org) {
      setEditingOrg(org)
      // Cargar datos de la organización en el formulario
      setFormData({
        nombreCompleto: org.nombreCompleto || '',
        descripcion: org.descripcion || '',
        ubicacionGoogleMaps: org.ubicacionGoogleMaps || '',
        clasificacion: org.clasificacion || '',
        estado: org.estado || 'ACTIVA',
        productosConsumen: org.productosConsumen || '',
        capacidadAlmacenamiento: org.capacidadAlmacenamiento || '',
        visitaInstitucional: '',
        categorizacion: '',
        personasAutorizadas: '',
        contacto1Nombre: org.contacto1Nombre || '',
        contacto1Cargo: '',
        contacto1Telefono: org.contacto1Telefono || '',
        contacto1Email: org.contacto1Email || '',
        contacto2Nombre: '',
        contacto2Telefono: '',
        contacto2Email: '',
        departamento: org.departamento || '',
        municipio: org.municipio || '',
        zona: '',
        direccionDetallada: '',
        telefono: '',
        departamento2: '',
        municipio2: '',
        zona2: '',
        direccion2: '',
        departamento3: '',
        municipio3: '',
        zona3: '',
        direccion3: '',
        tipoLaborSocial: org.tipoLaborSocial || '',
        tipoFinanciamiento: '',
        tiposProgramas: '',
        paginaSocial: '',
        logo: '',
        rangoEdad: '',
        poblacionTotalDEM: org.poblacionTotalDEM || 0,
        poblacionTotalBeneficiada: 0,
        primeraInfanciaMujeres: 0,
        primeraInfanciaHombres: 0,
        ninezMujeres: 0,
        ninezHombres: 0,
        jovenesMujeres: 0,
        jovenesHombres: 0,
        adultosMujeres: 0,
        adultosHombres: 0,
        adultosMayoresMujeres: 0,
        adultosMayoresHombres: 0,
        familiasAtendidas: 0,
        ninasMadres: 0,
        ninasLactantes: 0,
        personasFemenino: 0,
        personasMasculino: 0,
        departamentosAtendidos: '',
        municipiosAtendidos: '',
        nit: org.nit || '',
        nombreLegal: ''
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nombreCompleto: '',
      descripcion: '',
      ubicacionGoogleMaps: '',
      clasificacion: '',
      estado: 'ACTIVA',
      productosConsumen: '',
      capacidadAlmacenamiento: '',
      visitaInstitucional: '',
      categorizacion: '',
      personasAutorizadas: '',
      contacto1Nombre: '',
      contacto1Cargo: '',
      contacto1Telefono: '',
      contacto1Email: '',
      contacto2Nombre: '',
      contacto2Telefono: '',
      contacto2Email: '',
      departamento: '',
      municipio: '',
      zona: '',
      direccionDetallada: '',
      telefono: '',
      departamento2: '',
      municipio2: '',
      zona2: '',
      direccion2: '',
      departamento3: '',
      municipio3: '',
      zona3: '',
      direccion3: '',
      tipoLaborSocial: '',
      tipoFinanciamiento: '',
      tiposProgramas: '',
      paginaSocial: '',
      logo: '',
      rangoEdad: '',
      poblacionTotalDEM: 0,
      poblacionTotalBeneficiada: 0,
      primeraInfanciaMujeres: 0,
      primeraInfanciaHombres: 0,
      ninezMujeres: 0,
      ninezHombres: 0,
      jovenesMujeres: 0,
      jovenesHombres: 0,
      adultosMujeres: 0,
      adultosHombres: 0,
      adultosMayoresMujeres: 0,
      adultosMayoresHombres: 0,
      familiasAtendidas: 0,
      ninasMadres: 0,
      ninasLactantes: 0,
      personasFemenino: 0,
      personasMasculino: 0,
      departamentosAtendidos: '',
      municipiosAtendidos: '',
      nit: '',
      nombreLegal: ''
    })
    setEditingOrg(null)
  }

  const guardarOrganizacion = async () => {
    if (!formData.nombreCompleto) {
      toast.error('El nombre completo de la organización es requerido')
      return
    }

    try {
      setLoading(true)
      const dataToSend = {
        ...formData,
        nombre: formData.nombreCompleto // El nombre principal es el nombreCompleto
      }

      const method = editingOrg ? 'PUT' : 'POST'
      const url = editingOrg 
        ? `/api/organizaciones/${editingOrg.id}` 
        : '/api/organizaciones'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) throw new Error('Error al guardar organización')

      toast.success(`Organización ${editingOrg ? 'actualizada' : 'creada'} exitosamente`)
      await cargarOrganizaciones()
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar organización')
    } finally {
      setLoading(false)
    }
  }

  const eliminarOrganizacion = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta organización?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/organizaciones/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar organización')

      toast.success('Organización eliminada exitosamente')
      await cargarOrganizaciones()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar organización')
    } finally {
      setLoading(false)
    }
  }

  const organizacionesFiltradas = organizaciones.filter(org =>
    (org.nombreCompleto || org.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (org.departamento || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (org.municipio || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading && organizaciones.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando organizaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Gestión de Organizaciones
          </h2>
          <p className="text-muted-foreground">
            Administra las organizaciones beneficiarias del sistema
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Organización
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingOrg ? 'Editar Organización' : 'Nueva Organización'}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <Tabs defaultValue="basica" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basica">Información Básica</TabsTrigger>
                  <TabsTrigger value="contactos">Contactos</TabsTrigger>
                  <TabsTrigger value="ubicaciones">Ubicaciones</TabsTrigger>
                  <TabsTrigger value="beneficiarios">Beneficiarios</TabsTrigger>
                  <TabsTrigger value="legal">Legal</TabsTrigger>
                </TabsList>

                {/* Información Básica */}
                <TabsContent value="basica" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="nombreCompleto">Nombre Completo de la Organización *</Label>
                      <Input
                        id="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombreCompleto: e.target.value }))}
                        placeholder="Ej: Asociación Civil no lucrativa Mathias Bailon"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="descripcion">¿A qué se dedica la Organización social?</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Brindamos educación y terapias a niños con y sin discapacidad"
                        rows={3}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="ubicacionMaps">Ubicación Google Maps</Label>
                      <Input
                        id="ubicacionMaps"
                        value={formData.ubicacionGoogleMaps}
                        onChange={(e) => setFormData(prev => ({ ...prev, ubicacionGoogleMaps: e.target.value }))}
                        placeholder="https://www.google.com/maps/..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clasificacion">Clasificación</Label>
                      <Select
                        value={formData.clasificacion}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, clasificacion: value }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecciona clasificación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pequeña">Pequeña</SelectItem>
                          <SelectItem value="Mediana">Mediana</SelectItem>
                          <SelectItem value="Grande">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="estado">Estado (Estatus)</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVA">Activa</SelectItem>
                          <SelectItem value="SUSPENDIDA">Suspendida</SelectItem>
                          <SelectItem value="INACTIVA">Inactiva</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="productosConsumen">Productos que consumen</Label>
                      <Textarea
                        id="productosConsumen"
                        value={formData.productosConsumen}
                        onChange={(e) => setFormData(prev => ({ ...prev, productosConsumen: e.target.value }))}
                        placeholder="tomate, tomate manzano, hojas verdes, zanahoria..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="capacidad">Capacidad de almacenamiento</Label>
                      <Input
                        id="capacidad"
                        value={formData.capacidadAlmacenamiento}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacidadAlmacenamiento: e.target.value }))}
                        placeholder="200 libras"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="visita">Visita Institucional</Label>
                      <Input
                        id="visita"
                        value={formData.visitaInstitucional}
                        onChange={(e) => setFormData(prev => ({ ...prev, visitaInstitucional: e.target.value }))}
                        placeholder="2023"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="categorizacion">Categorización</Label>
                      <Input
                        id="categorizacion"
                        value={formData.categorizacion}
                        onChange={(e) => setFormData(prev => ({ ...prev, categorizacion: e.target.value }))}
                        placeholder="Bazar Interno/voluntariado"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="personasAutorizadas">Personas que pueden ingresar a DEM</Label>
                      <Input
                        id="personasAutorizadas"
                        value={formData.personasAutorizadas}
                        onChange={(e) => setFormData(prev => ({ ...prev, personasAutorizadas: e.target.value }))}
                        placeholder="Andrea Oliveros / Nidia Oliveros/ Mirna"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tipoLabor">Tipo de labor social</Label>
                      <Input
                        id="tipoLabor"
                        value={formData.tipoLaborSocial}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoLaborSocial: e.target.value }))}
                        placeholder="Centro de atención de personas con discapacidad"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="financiamiento">Tipo de financiamiento</Label>
                      <Textarea
                        id="financiamiento"
                        value={formData.tipoFinanciamiento}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoFinanciamiento: e.target.value }))}
                        placeholder="Donaciones (Monetarias o en especie), Talleres..."
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="programas">Tipos de programas de alimentación</Label>
                      <Input
                        id="programas"
                        value={formData.tiposProgramas}
                        onChange={(e) => setFormData(prev => ({ ...prev, tiposProgramas: e.target.value }))}
                        placeholder="Educación y terapias"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="paginaSocial">Página web o Facebook/Instagram</Label>
                      <Input
                        id="paginaSocial"
                        value={formData.paginaSocial}
                        onChange={(e) => setFormData(prev => ({ ...prev, paginaSocial: e.target.value }))}
                        placeholder="Asociacion Mathias Bailon"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="logo">URL del Logo</Label>
                      <Input
                        id="logo"
                        value={formData.logo}
                        onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Contactos */}
                <TabsContent value="contactos" className="space-y-6 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contacto Principal 1</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contacto1Nombre">Nombre Completo</Label>
                        <Input
                          id="contacto1Nombre"
                          value={formData.contacto1Nombre}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto1Nombre: e.target.value }))}
                          placeholder="Andrea Oliveros"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto1Cargo">Cargo laboral</Label>
                        <Input
                          id="contacto1Cargo"
                          value={formData.contacto1Cargo}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto1Cargo: e.target.value }))}
                          placeholder="Directora de proyectos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto1Telefono">Teléfono</Label>
                        <Input
                          id="contacto1Telefono"
                          value={formData.contacto1Telefono}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto1Telefono: e.target.value }))}
                          placeholder="50176789"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto1Email">Correo Electrónico</Label>
                        <Input
                          id="contacto1Email"
                          type="email"
                          value={formData.contacto1Email}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto1Email: e.target.value }))}
                          placeholder="andreeaoliveros@gmail.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contacto Principal 2</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="contacto2Nombre">Nombre Completo</Label>
                        <Input
                          id="contacto2Nombre"
                          value={formData.contacto2Nombre}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto2Nombre: e.target.value }))}
                          placeholder="Nidia Oliveros"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto2Telefono">Teléfono</Label>
                        <Input
                          id="contacto2Telefono"
                          value={formData.contacto2Telefono}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto2Telefono: e.target.value }))}
                          placeholder="55111654"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto2Email">Correo Electrónico</Label>
                        <Input
                          id="contacto2Email"
                          type="email"
                          value={formData.contacto2Email}
                          onChange={(e) => setFormData(prev => ({ ...prev, contacto2Email: e.target.value }))}
                          placeholder="asociacionmathiasbailon@gmail.com"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Ubicaciones */}
                <TabsContent value="ubicaciones" className="space-y-6 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ubicación Principal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input
                          id="departamento"
                          value={formData.departamento}
                          onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                          placeholder="Guatemala"
                        />
                      </div>
                      <div>
                        <Label htmlFor="municipio">Municipio</Label>
                        <Input
                          id="municipio"
                          value={formData.municipio}
                          onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
                          placeholder="La Florida"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zona">Zona</Label>
                        <Input
                          id="zona"
                          value={formData.zona}
                          onChange={(e) => setFormData(prev => ({ ...prev, zona: e.target.value }))}
                          placeholder="19"
                        />
                      </div>
                      <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                          id="direccion"
                          value={formData.direccionDetallada}
                          onChange={(e) => setFormData(prev => ({ ...prev, direccionDetallada: e.target.value }))}
                          placeholder="8 av 3-70"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono y horarios de atención</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                          placeholder="2234-5678"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ubicación 2 (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="departamento2">Departamento</Label>
                        <Input
                          id="departamento2"
                          value={formData.departamento2}
                          onChange={(e) => setFormData(prev => ({ ...prev, departamento2: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="municipio2">Municipio</Label>
                        <Input
                          id="municipio2"
                          value={formData.municipio2}
                          onChange={(e) => setFormData(prev => ({ ...prev, municipio2: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zona2">Zona</Label>
                        <Input
                          id="zona2"
                          value={formData.zona2}
                          onChange={(e) => setFormData(prev => ({ ...prev, zona2: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="direccion2">Dirección</Label>
                        <Input
                          id="direccion2"
                          value={formData.direccion2}
                          onChange={(e) => setFormData(prev => ({ ...prev, direccion2: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ubicación 3 (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="departamento3">Departamento</Label>
                        <Input
                          id="departamento3"
                          value={formData.departamento3}
                          onChange={(e) => setFormData(prev => ({ ...prev, departamento3: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="municipio3">Municipio</Label>
                        <Input
                          id="municipio3"
                          value={formData.municipio3}
                          onChange={(e) => setFormData(prev => ({ ...prev, municipio3: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zona3">Zona</Label>
                        <Input
                          id="zona3"
                          value={formData.zona3}
                          onChange={(e) => setFormData(prev => ({ ...prev, zona3: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="direccion3">Dirección</Label>
                        <Input
                          id="direccion3"
                          value={formData.direccion3}
                          onChange={(e) => setFormData(prev => ({ ...prev, direccion3: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cobertura Geográfica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deptosAtendidos">Departamentos atendidos</Label>
                        <Input
                          id="deptosAtendidos"
                          value={formData.departamentosAtendidos}
                          onChange={(e) => setFormData(prev => ({ ...prev, departamentosAtendidos: e.target.value }))}
                          placeholder="Guatemala"
                        />
                      </div>
                      <div>
                        <Label htmlFor="muniAtendidos">Municipios atendidos</Label>
                        <Input
                          id="muniAtendidos"
                          value={formData.municipiosAtendidos}
                          onChange={(e) => setFormData(prev => ({ ...prev, municipiosAtendidos: e.target.value }))}
                          placeholder="Amatitlan, Villa Nueva, Guatemala"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Beneficiarios */}
                <TabsContent value="beneficiarios" className="space-y-6 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rangoEdad">Rango de Edad</Label>
                        <Input
                          id="rangoEdad"
                          value={formData.rangoEdad}
                          onChange={(e) => setFormData(prev => ({ ...prev, rangoEdad: e.target.value }))}
                          placeholder="3 a 18"
                        />
                      </div>
                      <div>
                        <Label htmlFor="poblacionDEM">Población total con DEM</Label>
                        <Input
                          id="poblacionDEM"
                          type="number"
                          value={formData.poblacionTotalDEM}
                          onChange={(e) => setFormData(prev => ({ ...prev, poblacionTotalDEM: parseInt(e.target.value) || 0 }))}
                          placeholder="95"
                        />
                      </div>
                      <div>
                        <Label htmlFor="poblacionTotal">Población total beneficiada</Label>
                        <Input
                          id="poblacionTotal"
                          type="number"
                          value={formData.poblacionTotalBeneficiada}
                          onChange={(e) => setFormData(prev => ({ ...prev, poblacionTotalBeneficiada: parseInt(e.target.value) || 0 }))}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Demografía por Edad y Género</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Primera Infancia (0-2) Mujeres</Label>
                        <Input
                          type="number"
                          value={formData.primeraInfanciaMujeres}
                          onChange={(e) => setFormData(prev => ({ ...prev, primeraInfanciaMujeres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Primera Infancia (0-2) Hombres</Label>
                        <Input
                          type="number"
                          value={formData.primeraInfanciaHombres}
                          onChange={(e) => setFormData(prev => ({ ...prev, primeraInfanciaHombres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Niñez (3-5) Mujeres</Label>
                        <Input
                          type="number"
                          value={formData.ninezMujeres}
                          onChange={(e) => setFormData(prev => ({ ...prev, ninezMujeres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Niñez (3-5) Hombres</Label>
                        <Input
                          type="number"
                          value={formData.ninezHombres}
                          onChange={(e) => setFormData(prev => ({ ...prev, ninezHombres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Jóvenes (6-10) Mujeres</Label>
                        <Input
                          type="number"
                          value={formData.jovenesMujeres}
                          onChange={(e) => setFormData(prev => ({ ...prev, jovenesMujeres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Jóvenes (6-10) Hombres</Label>
                        <Input
                          type="number"
                          value={formData.jovenesHombres}
                          onChange={(e) => setFormData(prev => ({ ...prev, jovenesHombres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Adultos (11-18) Mujeres</Label>
                        <Input
                          type="number"
                          value={formData.adultosMujeres}
                          onChange={(e) => setFormData(prev => ({ ...prev, adultosMujeres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Adultos (11-18) Hombres</Label>
                        <Input
                          type="number"
                          value={formData.adultosHombres}
                          onChange={(e) => setFormData(prev => ({ ...prev, adultosHombres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Adultos Mayores (60+) Mujeres</Label>
                        <Input
                          type="number"
                          value={formData.adultosMayoresMujeres}
                          onChange={(e) => setFormData(prev => ({ ...prev, adultosMayoresMujeres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Adultos Mayores (60+) Hombres</Label>
                        <Input
                          type="number"
                          value={formData.adultosMayoresHombres}
                          onChange={(e) => setFormData(prev => ({ ...prev, adultosMayoresHombres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Otros Indicadores</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Familias atendidas</Label>
                        <Input
                          type="number"
                          value={formData.familiasAtendidas}
                          onChange={(e) => setFormData(prev => ({ ...prev, familiasAtendidas: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Niñas madres</Label>
                        <Input
                          type="number"
                          value={formData.ninasMadres}
                          onChange={(e) => setFormData(prev => ({ ...prev, ninasMadres: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Niñas lactantes</Label>
                        <Input
                          type="number"
                          value={formData.ninasLactantes}
                          onChange={(e) => setFormData(prev => ({ ...prev, ninasLactantes: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Personas sexo femenino</Label>
                        <Input
                          type="number"
                          value={formData.personasFemenino}
                          onChange={(e) => setFormData(prev => ({ ...prev, personasFemenino: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Personas sexo masculino</Label>
                        <Input
                          type="number"
                          value={formData.personasMasculino}
                          onChange={(e) => setFormData(prev => ({ ...prev, personasMasculino: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Legal */}
                <TabsContent value="legal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nit">NIT</Label>
                      <Input
                        id="nit"
                        value={formData.nit}
                        onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                        placeholder="9626221-4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombreLegal">Nombre Legal</Label>
                      <Input
                        id="nombreLegal"
                        value={formData.nombreLegal}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombreLegal: e.target.value }))}
                        placeholder="ASOCIACION CIVIL NO LUCRATIVA MATHIAS BAILON"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={guardarOrganizacion} disabled={loading}>
                {loading ? 'Guardando...' : editingOrg ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Organizaciones</p>
                <p className="text-2xl font-bold">{organizaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold">{organizaciones.filter(o => o.estado === 'ACTIVA').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Suspendidas</p>
                <p className="text-2xl font-bold">{organizaciones.filter(o => o.estado === 'SUSPENDIDA').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Inactivas</p>
                <p className="text-2xl font-bold">{organizaciones.filter(o => o.estado === 'INACTIVA').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Organizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, departamento o municipio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Clasificación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Población DEM</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizacionesFiltradas.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate" title={org.nombreCompleto || org.nombre}>
                        {org.nombreCompleto || org.nombre}
                      </div>
                    </TableCell>
                    <TableCell>{org.clasificacion || '-'}</TableCell>
                    <TableCell>
                      <Badge className={
                        org.estado === 'ACTIVA' 
                          ? 'bg-green-100 text-green-800' 
                          : org.estado === 'SUSPENDIDA'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {org.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.departamento || '-'}</TableCell>
                    <TableCell>{org.municipio || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{org.contacto1Nombre || '-'}</div>
                        <div className="text-muted-foreground">{org.contacto1Telefono || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{org.poblacionTotalDEM || 0}</TableCell>
                    <TableCell>{org.nit || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => abrirModal(org)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => eliminarOrganizacion(org.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
    </div>
  )
}

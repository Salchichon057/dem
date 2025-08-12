"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface FormularioVoluntario {
  nombre: string
  apellidos: string
  edad: string
  telefono: string
  email: string
  direccion: string
  area: string
  experiencia: string
  disponibilidad: string[]
  motivacion: string
  habilidades: string
  referencias: string
  terminos: boolean
}

export function FormularioVoluntariadoSection() {
  const [formulario, setFormulario] = useState<FormularioVoluntario>({
    nombre: "",
    apellidos: "",
    edad: "",
    telefono: "",
    email: "",
    direccion: "",
    area: "",
    experiencia: "",
    disponibilidad: [],
    motivacion: "",
    habilidades: "",
    referencias: "",
    terminos: false
  })

  const [loading, setLoading] = useState(false)

  const areasDisponibles = [
    "Educación",
    "Salud",
    "Medio Ambiente",
    "Tecnología",
    "Deportes",
    "Arte y Cultura",
    "Asistencia Social",
    "Comunicación",
    "Administración",
    "Otro"
  ]

  const horarios = [
    "Lunes - Mañana",
    "Lunes - Tarde",
    "Martes - Mañana", 
    "Martes - Tarde",
    "Miércoles - Mañana",
    "Miércoles - Tarde",
    "Jueves - Mañana",
    "Jueves - Tarde",
    "Viernes - Mañana",
    "Viernes - Tarde",
    "Sábado - Mañana",
    "Sábado - Tarde",
    "Domingo - Mañana",
    "Domingo - Tarde"
  ]

  const handleInputChange = (field: keyof FormularioVoluntario, value: string | boolean) => {
    setFormulario(prev => ({ ...prev, [field]: value }))
  }

  const toggleDisponibilidad = (horario: string) => {
    setFormulario(prev => ({
      ...prev,
      disponibilidad: prev.disponibilidad.includes(horario)
        ? prev.disponibilidad.filter(h => h !== horario)
        : [...prev.disponibilidad, horario]
    }))
  }

  const validarFormulario = () => {
    const campos = [
      'nombre', 'apellidos', 'edad', 'telefono', 'email', 
      'direccion', 'area', 'motivacion'
    ]
    
    for (const campo of campos) {
      if (!formulario[campo as keyof FormularioVoluntario]) {
        toast.error(`El campo ${campo} es requerido`)
        return false
      }
    }

    if (formulario.disponibilidad.length === 0) {
      toast.error('Debe seleccionar al menos un horario de disponibilidad')
      return false
    }

    if (!formulario.terminos) {
      toast.error('Debe aceptar los términos y condiciones')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarFormulario()) return

    try {
      setLoading(true)
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Formulario enviado exitosamente. Nos pondremos en contacto pronto.')
      
      // Limpiar formulario
      setFormulario({
        nombre: "",
        apellidos: "",
        edad: "",
        telefono: "",
        email: "",
        direccion: "",
        area: "",
        experiencia: "",
        disponibilidad: [],
        motivacion: "",
        habilidades: "",
        referencias: "",
        terminos: false
      })
    } catch {
      toast.error('Error al enviar el formulario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Formulario de Voluntariado</h1>
        <p className="text-gray-600">Únete a nuestro programa de voluntariado y marca la diferencia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Información Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formulario.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formulario.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  placeholder="Tus apellidos"
                />
              </div>
              <div>
                <Label htmlFor="edad">Edad *</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formulario.edad}
                  onChange={(e) => handleInputChange('edad', e.target.value)}
                  placeholder="Tu edad"
                  min="16"
                  max="80"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="telefono"
                    value={formulario.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="Tu número de teléfono"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formulario.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="direccion">Dirección *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="direccion"
                    value={formulario.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Tu dirección completa"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área de Interés */}
        <Card>
          <CardHeader>
            <CardTitle>Área de Voluntariado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="area">Área de Interés *</Label>
              <Select value={formulario.area} onValueChange={(value) => handleInputChange('area', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el área donde te gustaría colaborar" />
                </SelectTrigger>
                <SelectContent>
                  {areasDisponibles.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experiencia">Experiencia Previa</Label>
              <Textarea
                id="experiencia"
                value={formulario.experiencia}
                onChange={(e) => handleInputChange('experiencia', e.target.value)}
                placeholder="Describe cualquier experiencia previa en voluntariado o el área seleccionada"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Disponibilidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Disponibilidad de Tiempo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="mb-3 block">Selecciona tus horarios disponibles *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {horarios.map((horario) => (
                  <Badge
                    key={horario}
                    variant={formulario.disponibilidad.includes(horario) ? "default" : "outline"}
                    className={`cursor-pointer p-2 text-center transition-colors ${
                      formulario.disponibilidad.includes(horario)
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-purple-100"
                    }`}
                    onClick={() => toggleDisponibilidad(horario)}
                  >
                    {horario}
                  </Badge>
                ))}
              </div>
              {formulario.disponibilidad.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {formulario.disponibilidad.length} horario(s) seleccionado(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="motivacion">Motivación *</Label>
              <Textarea
                id="motivacion"
                value={formulario.motivacion}
                onChange={(e) => handleInputChange('motivacion', e.target.value)}
                placeholder="¿Por qué te interesa ser voluntario? ¿Qué esperas aportar?"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="habilidades">Habilidades Especiales</Label>
              <Textarea
                id="habilidades"
                value={formulario.habilidades}
                onChange={(e) => handleInputChange('habilidades', e.target.value)}
                placeholder="Menciona cualquier habilidad especial que puedas aportar"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="referencias">Referencias</Label>
              <Textarea
                id="referencias"
                value={formulario.referencias}
                onChange={(e) => handleInputChange('referencias', e.target.value)}
                placeholder="Nombre y contacto de una referencia personal (opcional)"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Términos y Condiciones */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terminos"
                checked={formulario.terminos}
                onChange={(e) => handleInputChange('terminos', e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="terminos" className="text-sm leading-5">
                Acepto los términos y condiciones del programa de voluntariado. 
                Entiendo que mi participación es voluntaria y que debo cumplir con 
                los compromisos adquiridos. *
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Botón de Envío */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Enviar Solicitud</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

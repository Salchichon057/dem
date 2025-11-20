'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '@/lib/types'
import { getDepartamentos, getMunicipiosByDepartamento } from '@/lib/data/guatemala-helper'
import { validateBeneficiary } from '@/lib/validators/beneficiary.validator'
import { toast } from 'sonner'
import { Loader2, X, Image as ImageIcon } from 'lucide-react'
import { uploadBeneficiaryPhoto, getFileUrl } from '@/lib/storage/handler'
import Image from 'next/image'
import { useUser } from '@/hooks/use-user'

interface BeneficiaryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  beneficiary?: Beneficiary | null
  onSuccess: () => void
}

export default function BeneficiaryForm({
  open,
  onOpenChange,
  beneficiary,
  onSuccess,
}: BeneficiaryFormProps) {
  const { user } = useUser()
  const isEdit = !!beneficiary
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Form fields
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'Masculino' | 'Femenino' | ''>('')
  const [dpi, setDpi] = useState('')
  const [program, setProgram] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [admissionDate, setAdmissionDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Location fields
  const [department, setDepartment] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [village, setVillage] = useState('')
  const [address, setAddress] = useState('')
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')

  // Location data
  const [departments, setDepartments] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>([])

  // Load departments on mount
  useEffect(() => {
    setDepartments(getDepartamentos())
  }, [])

  // Update municipalities when department changes
  useEffect(() => {
    if (department) {
      setMunicipalities(getMunicipiosByDepartamento(department))
    } else {
      setMunicipalities([])
      setMunicipality('')
    }
  }, [department])

  // Populate form when editing
  useEffect(() => {
    if (beneficiary) {
      setName(beneficiary.name)
      setAge(beneficiary.age.toString())
      setGender(beneficiary.gender)
      setDpi(beneficiary.dpi || '')
      setProgram(beneficiary.program)
      setPhotoUrl(beneficiary.photo_url || '')
      setAdmissionDate(beneficiary.admission_date.split('T')[0]) // Format for input[type="date"]
      setIsActive(beneficiary.is_active)
      setDepartment(beneficiary.department)
      setMunicipality(beneficiary.municipality)
      setVillage(beneficiary.village || '')
      setAddress(beneficiary.address || '')
      setGoogleMapsUrl(beneficiary.google_maps_url || '')
    } else {
      resetForm()
    }
  }, [beneficiary, open])

  // Cleanup preview URL cuando se desmonte
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const resetForm = () => {
    setName('')
    setAge('')
    setGender('')
    setDpi('')
    setProgram('')
    setPhotoUrl('')
    setPhotoFile(null)
    setPhotoPreview('')
    setAdmissionDate('')
    setIsActive(true)
    setDepartment('')
    setMunicipality('')
    setVillage('')
    setAddress('')
    setGoogleMapsUrl('')
  }

  // Manejar selección de archivo de foto (solo preview, no subir aún)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede exceder 5MB')
      return
    }

    // Guardar archivo en stage y crear preview local
    setPhotoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
    toast.success('Foto lista para subir')
  }

  // Remover foto
  const handleRemovePhoto = () => {
    // Limpiar preview URL para evitar memory leak
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    
    setPhotoFile(null)
    setPhotoPreview('')
    if (isEdit) {
      setPhotoUrl('') // Si estamos editando, también limpiar la URL existente
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({}) // Limpiar errores previos

    try {
      setLoading(true)

      // Subir foto si hay un archivo nuevo
      let finalPhotoUrl = photoUrl
      if (photoFile) {
        if (!user?.id) {
          toast.error('Debes iniciar sesión para subir archivos')
          setLoading(false)
          return
        }
        
        const resourceId = beneficiary?.id || `temp-${Date.now()}`
        const relativePath = await uploadBeneficiaryPhoto(photoFile, user.id, resourceId)
        finalPhotoUrl = getFileUrl(relativePath)
      }

      // Preparar datos
      const ageNum = parseInt(age)
      
      const data: CreateBeneficiaryInput | UpdateBeneficiaryInput = {
        name,
        age: ageNum,
        gender: gender as 'Masculino' | 'Femenino',
        dpi: dpi || '',
        program,
        photo_url: finalPhotoUrl || '',
        admission_date: admissionDate,
        is_active: isActive,
        department,
        municipality,
        village: village || '',
        address: address || '',
        google_maps_url: googleMapsUrl || '',
      }

      // Validar con Zod
      const validation = validateBeneficiary(data, isEdit)
      
      if (!validation.success) {
        // Convertir errores de Zod a un objeto simple
        const errors: Record<string, string> = {}
        Object.entries(validation.errors).forEach(([key, messages]) => {
          if (messages && messages.length > 0) {
            errors[key] = messages[0]
          }
        })
        setValidationErrors(errors)
        toast.error('Por favor corrija los errores en el formulario')
        return
      }

      const url = isEdit ? `/api/beneficiaries/${beneficiary.id}` : '/api/beneficiaries'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      if (response.ok) {
        toast.success(isEdit ? 'Beneficiario actualizado' : 'Beneficiario creado')
        onSuccess()
        onOpenChange(false)
        if (!isEdit) resetForm()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar beneficiario')
      }
    } catch (error) {
      console.error('Error saving beneficiary:', error)
      toast.error('Error al guardar beneficiario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Beneficiario' : 'Agregar Beneficiario'}
          </DialogTitle>
          <DialogDescription>
            Complete los datos del beneficiario. Los campos con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Información Personal</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label 
                  htmlFor="name" 
                  className={`text-sm font-medium ${validationErrors.name ? 'text-red-500' : ''}`}
                >
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: María López García"
                  required
                  className={`w-full ${validationErrors.name ? 'border-red-500' : ''}`}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-500">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="age" 
                  className={`text-sm font-medium ${validationErrors.age ? 'text-red-500' : ''}`}
                >
                  Edad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ej: 75"
                  required
                  className={`w-full ${validationErrors.age ? 'border-red-500' : ''}`}
                />
                {validationErrors.age && (
                  <p className="text-xs text-red-500">{validationErrors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="gender" 
                  className={`text-sm font-medium ${validationErrors.gender ? 'text-red-500' : ''}`}
                >
                  Género <span className="text-red-500">*</span>
                </Label>
                <Select value={gender} onValueChange={(value) => setGender(value as 'Masculino' | 'Femenino')}>
                  <SelectTrigger 
                    id="gender" 
                    className={`w-full ${validationErrors.gender ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.gender && (
                  <p className="text-xs text-red-500">{validationErrors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="dpi" 
                  className={`text-sm font-medium ${validationErrors.dpi ? 'text-red-500' : ''}`}
                >
                  DPI
                </Label>
                <Input
                  id="dpi"
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  placeholder="Ej: 1234567890101"
                  maxLength={13}
                  className={`w-full ${validationErrors.dpi ? 'border-red-500' : ''}`}
                />
                {validationErrors.dpi && (
                  <p className="text-xs text-red-500">{validationErrors.dpi}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="admissionDate" 
                  className={`text-sm font-medium ${validationErrors.admission_date ? 'text-red-500' : ''}`}
                >
                  Fecha de Ingreso <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className={`w-full ${validationErrors.admission_date ? 'border-red-500' : ''}`}
                />
                {validationErrors.admission_date && (
                  <p className="text-xs text-red-500">{validationErrors.admission_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Programa y Estado */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Programa</h3>
            
            <div className="space-y-4">
              {/* Foto */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-sm font-medium">
                  Foto
                </Label>
                <div className="flex items-start gap-4">
                  {(photoPreview || photoUrl) ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={photoPreview || photoUrl}
                        alt="Foto del beneficiario"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        title="Eliminar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {photoPreview && (
                        <div className="absolute bottom-1 left-1 right-1 bg-blue-500/90 text-white text-xs px-2 py-1 rounded text-center">
                          Lista para subir
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                      Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                      {photoFile && (
                        <span className="block text-blue-600 font-medium mt-1">
                          ✓ Foto seleccionada: {photoFile.name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="program" 
                  className={`text-sm font-medium ${validationErrors.program ? 'text-red-500' : ''}`}
                >
                  Tipo de Programa <span className="text-red-500">*</span>
                </Label>
                <Select value={program} onValueChange={setProgram}>
                  <SelectTrigger 
                    id="program" 
                    className={`w-full ${validationErrors.program ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentación">Alimentación</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Vivienda">Vivienda</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Recreación">Recreación</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.program && (
                  <p className="text-xs text-red-500">{validationErrors.program}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive" className="text-sm font-medium">Estado</Label>
                <div className="flex items-center gap-3 h-9 px-3 rounded-md border bg-gray-50">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Ubicación</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="department" 
                  className={`text-sm font-medium ${validationErrors.department ? 'text-red-500' : ''}`}
                >
                  Departamento <span className="text-red-500">*</span>
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger 
                    id="department" 
                    className={`w-full ${validationErrors.department ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.department && (
                  <p className="text-xs text-red-500">{validationErrors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="municipality" 
                  className={`text-sm font-medium ${validationErrors.municipality ? 'text-red-500' : ''}`}
                >
                  Municipio <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={municipality}
                  onValueChange={setMunicipality}
                  disabled={!department}
                >
                  <SelectTrigger 
                    id="municipality" 
                    className={`w-full ${validationErrors.municipality ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder={department ? "Seleccione" : "Primero seleccione departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((muni) => (
                      <SelectItem key={muni} value={muni}>
                        {muni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.municipality && (
                  <p className="text-xs text-red-500">{validationErrors.municipality}</p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label 
                  htmlFor="village" 
                  className={`text-sm font-medium ${validationErrors.village ? 'text-red-500' : ''}`}
                >
                  Aldea / Comunidad
                </Label>
                <Input
                  id="village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Ej: Aldea San José"
                  className={`w-full ${validationErrors.village ? 'border-red-500' : ''}`}
                />
                {validationErrors.village && (
                  <p className="text-xs text-red-500">{validationErrors.village}</p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label 
                  htmlFor="address" 
                  className={`text-sm font-medium ${validationErrors.address ? 'text-red-500' : ''}`}
                >
                  Dirección
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Zona 1, 3ra Calle 4-56"
                  className={`w-full ${validationErrors.address ? 'border-red-500' : ''}`}
                />
                {validationErrors.address && (
                  <p className="text-xs text-red-500">{validationErrors.address}</p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label 
                  htmlFor="googleMapsUrl" 
                  className={`text-sm font-medium ${validationErrors.google_maps_url ? 'text-red-500' : ''}`}
                >
                  URL de Google Maps
                </Label>
                <Input
                  id="googleMapsUrl"
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/... o https://maps.app.goo.gl/..."
                  className={`w-full ${validationErrors.google_maps_url ? 'border-red-500' : ''}`}
                />
                <p className="text-xs text-gray-500">
                  Acepta cualquier URL de Google Maps (google.com/maps, maps.google.com, goo.gl, maps.app.goo.gl)
                </p>
                {validationErrors.google_maps_url && (
                  <p className="text-xs text-red-500">{validationErrors.google_maps_url}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Enviando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

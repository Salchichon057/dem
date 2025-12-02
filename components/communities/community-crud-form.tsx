'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Community } from '@/lib/types/community'
import { toast } from 'sonner'
import { Calendar, MapPin, Users, Phone, FileText } from 'lucide-react'

interface CommunityCrudFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  community?: Community | null // Si viene con datos, es EDITAR; si no, es CREAR
}

export default function CommunityCrudForm({ 
  open, 
  onOpenChange, 
  onSuccess,
  community 
}: CommunityCrudFormProps) {
  const isEditMode = !!community
  const [loading, setLoading] = useState(false)

  // Datos básicos
  const [registrationDate, setRegistrationDate] = useState('')
  const [department, setDepartment] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [villages, setVillages] = useState('')
  const [hamletsServed, setHamletsServed] = useState('')
  const [hamletsCount, setHamletsCount] = useState('')
  const [googleMapsUrl, setGoogleMapsUrl] = useState('')
  
  // Líder
  const [leaderName, setLeaderName] = useState('')
  const [leaderPhone, setLeaderPhone] = useState('')
  const [isInLeadersGroup, setIsInLeadersGroup] = useState(false)
  
  // Comité
  const [communityCommittee, setCommunityCommittee] = useState('')
  
  // Estado
  const [status, setStatus] = useState<'activa' | 'inactiva' | 'suspendida'>('activa')
  const [inactiveReason, setInactiveReason] = useState('')
  const [terminationDate, setTerminationDate] = useState('')
  const [terminationReason, setTerminationReason] = useState('')
  
  // Familias
  const [totalFamilies, setTotalFamilies] = useState('')
  const [familiesInRa, setFamiliesInRa] = useState('')
  
  // Datos demográficos
  const [earlyChildhoodWomen, setEarlyChildhoodWomen] = useState('')
  const [earlyChildhoodMen, setEarlyChildhoodMen] = useState('')
  const [childhood35Women, setChildhood35Women] = useState('')
  const [childhood35Men, setChildhood35Men] = useState('')
  const [youth610Women, setYouth610Women] = useState('')
  const [youth610Men, setYouth610Men] = useState('')
  const [adults1118Women, setAdults1118Women] = useState('')
  const [adults1118Men, setAdults1118Men] = useState('')
  const [adults1960Women, setAdults1960Women] = useState('')
  const [adults1960Men, setAdults1960Men] = useState('')
  const [seniors61PlusWomen, setSeniors61PlusWomen] = useState('')
  const [seniors61PlusMen, setSeniors61PlusMen] = useState('')
  const [pregnantWomen, setPregnantWomen] = useState('')
  const [lactatingWomen, setLactatingWomen] = useState('')
  
  // Otros
  const [placementType, setPlacementType] = useState('')
  const [hasWhatsappGroup, setHasWhatsappGroup] = useState(false)
  const [classification, setClassification] = useState<'Pequeña' | 'Mediana' | 'Grande' | ''>('')
  const [storageCapacity, setStorageCapacity] = useState('')
  const [placementMethods, setPlacementMethods] = useState('')
  const [photoReferenceUrl, setPhotoReferenceUrl] = useState('')

  // Cargar datos si es modo edición
  useEffect(() => {
    if (community && open) {
      setRegistrationDate(community.registration_date ? new Date(community.registration_date).toISOString().split('T')[0] : '')
      setDepartment(community.department || '')
      setMunicipality(community.municipality || '')
      setVillages(community.villages || '')
      setHamletsServed(community.hamlets_served || '')
      setHamletsCount(community.hamlets_count?.toString() || '')
      setGoogleMapsUrl(community.google_maps_url || '')
      setLeaderName(community.leader_name || '')
      setLeaderPhone(community.leader_phone || '')
      setIsInLeadersGroup(community.is_in_leaders_group || false)
      setCommunityCommittee(community.community_committee || '')
      setStatus(community.status)
      setInactiveReason(community.inactive_reason || '')
      setTerminationDate(community.termination_date ? new Date(community.termination_date).toISOString().split('T')[0] : '')
      setTerminationReason(community.termination_reason || '')
      setTotalFamilies(community.total_families?.toString() || '')
      setFamiliesInRa(community.families_in_ra?.toString() || '')
      setEarlyChildhoodWomen(community.early_childhood_women?.toString() || '')
      setEarlyChildhoodMen(community.early_childhood_men?.toString() || '')
      setChildhood35Women(community.childhood_3_5_women?.toString() || '')
      setChildhood35Men(community.childhood_3_5_men?.toString() || '')
      setYouth610Women(community.youth_6_10_women?.toString() || '')
      setYouth610Men(community.youth_6_10_men?.toString() || '')
      setAdults1118Women(community.adults_11_18_women?.toString() || '')
      setAdults1118Men(community.adults_11_18_men?.toString() || '')
      setAdults1960Women(community.adults_19_60_women?.toString() || '')
      setAdults1960Men(community.adults_19_60_men?.toString() || '')
      setSeniors61PlusWomen(community.seniors_61_plus_women?.toString() || '')
      setSeniors61PlusMen(community.seniors_61_plus_men?.toString() || '')
      setPregnantWomen(community.pregnant_women?.toString() || '')
      setLactatingWomen(community.lactating_women?.toString() || '')
      setPlacementType(community.placement_type || '')
      setHasWhatsappGroup(community.has_whatsapp_group || false)
      setClassification(community.classification || '')
      setStorageCapacity(community.storage_capacity || '')
      setPlacementMethods(community.placement_methods || '')
      setPhotoReferenceUrl(community.photo_reference_url || '')
    } else if (!community && open) {
      // Reset para modo crear
      resetForm()
    }
  }, [community, open])

  const resetForm = () => {
    setRegistrationDate('')
    setDepartment('')
    setMunicipality('')
    setVillages('')
    setHamletsServed('')
    setHamletsCount('')
    setGoogleMapsUrl('')
    setLeaderName('')
    setLeaderPhone('')
    setIsInLeadersGroup(false)
    setCommunityCommittee('')
    setStatus('activa')
    setInactiveReason('')
    setTerminationDate('')
    setTerminationReason('')
    setTotalFamilies('')
    setFamiliesInRa('')
    setEarlyChildhoodWomen('')
    setEarlyChildhoodMen('')
    setChildhood35Women('')
    setChildhood35Men('')
    setYouth610Women('')
    setYouth610Men('')
    setAdults1118Women('')
    setAdults1118Men('')
    setAdults1960Women('')
    setAdults1960Men('')
    setSeniors61PlusWomen('')
    setSeniors61PlusMen('')
    setPregnantWomen('')
    setLactatingWomen('')
    setPlacementType('')
    setHasWhatsappGroup(false)
    setClassification('')
    setStorageCapacity('')
    setPlacementMethods('')
    setPhotoReferenceUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!department.trim()) {
      toast.error('El departamento es requerido')
      return
    }
    if (!municipality.trim()) {
      toast.error('El municipio es requerido')
      return
    }
    if (!villages.trim()) {
      toast.error('La aldea es requerida')
      return
    }

    try {
      setLoading(true)

      const payload = {
        registration_date: registrationDate || null,
        department: department.trim(),
        municipality: municipality.trim(),
        villages: villages.trim(),
        hamlets_served: hamletsServed.trim() || null,
        hamlets_count: hamletsCount ? parseInt(hamletsCount) : null,
        google_maps_url: googleMapsUrl.trim() || null,
        leader_name: leaderName.trim() || null,
        leader_phone: leaderPhone.trim() || null,
        is_in_leaders_group: isInLeadersGroup,
        community_committee: communityCommittee.trim() || null,
        status,
        inactive_reason: inactiveReason.trim() || null,
        termination_date: terminationDate || null,
        termination_reason: terminationReason.trim() || null,
        total_families: totalFamilies ? parseInt(totalFamilies) : null,
        families_in_ra: familiesInRa ? parseInt(familiesInRa) : null,
        early_childhood_women: earlyChildhoodWomen ? parseInt(earlyChildhoodWomen) : 0,
        early_childhood_men: earlyChildhoodMen ? parseInt(earlyChildhoodMen) : 0,
        childhood_3_5_women: childhood35Women ? parseInt(childhood35Women) : 0,
        childhood_3_5_men: childhood35Men ? parseInt(childhood35Men) : 0,
        youth_6_10_women: youth610Women ? parseInt(youth610Women) : 0,
        youth_6_10_men: youth610Men ? parseInt(youth610Men) : 0,
        adults_11_18_women: adults1118Women ? parseInt(adults1118Women) : 0,
        adults_11_18_men: adults1118Men ? parseInt(adults1118Men) : 0,
        adults_19_60_women: adults1960Women ? parseInt(adults1960Women) : 0,
        adults_19_60_men: adults1960Men ? parseInt(adults1960Men) : 0,
        seniors_61_plus_women: seniors61PlusWomen ? parseInt(seniors61PlusWomen) : 0,
        seniors_61_plus_men: seniors61PlusMen ? parseInt(seniors61PlusMen) : 0,
        pregnant_women: pregnantWomen ? parseInt(pregnantWomen) : 0,
        lactating_women: lactatingWomen ? parseInt(lactatingWomen) : 0,
        placement_type: placementType.trim() || null,
        has_whatsapp_group: hasWhatsappGroup,
        classification: classification || null,
        storage_capacity: storageCapacity.trim() || null,
        placement_methods: placementMethods.trim() || null,
        photo_reference_url: photoReferenceUrl.trim() || null,
      }

      const url = isEditMode ? `/api/communities/${community.id}` : '/api/communities'
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar comunidad')
      }

      toast.success(isEditMode ? 'Comunidad actualizada exitosamente' : 'Comunidad creada exitosamente')
      onSuccess()
      onOpenChange(false)
      resetForm()

    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar comunidad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Editar Comunidad' : 'Agregar Nueva Comunidad'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? 'Modifica los datos de la comunidad' : 'Completa los datos de la nueva comunidad'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Datos Básicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Datos Básicos
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registration_date">Fecha de Inscripción</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="registration_date"
                        type="date"
                        value={registrationDate}
                        onChange={(e) => setRegistrationDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="department">Departamento *</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ej: Chimaltenango"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="municipality">Municipio *</Label>
                    <Input
                      id="municipality"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="Ej: San Martin Jilotepeque"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="villages">Aldea / Comunidad *</Label>
                    <Input
                      id="villages"
                      value={villages}
                      onChange={(e) => setVillages(e.target.value)}
                      placeholder="Ej: Barrio el Calvario Zona 2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hamlets_count">Cantidad de Caseríos</Label>
                    <Input
                      id="hamlets_count"
                      type="number"
                      min="0"
                      value={hamletsCount}
                      onChange={(e) => setHamletsCount(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="google_maps_url">Ubicación Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://www.google.com/maps/..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="hamlets_served">Caseríos que Atiende</Label>
                  <Textarea
                    id="hamlets_served"
                    value={hamletsServed}
                    onChange={(e) => setHamletsServed(e.target.value)}
                    placeholder="Lista de caseríos separados por comas o saltos de línea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Líder y Comité */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Líder y Comité
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leader_name">Nombre del Líder</Label>
                    <Input
                      id="leader_name"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      placeholder="Ej: Maria Ines Ixcaco Bernardino"
                    />
                  </div>

                  <div>
                    <Label htmlFor="leader_phone">Teléfono del Líder</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="leader_phone"
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                        placeholder="50358603"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_in_leaders_group"
                    checked={isInLeadersGroup}
                    onCheckedChange={setIsInLeadersGroup}
                  />
                  <Label htmlFor="is_in_leaders_group" className="cursor-pointer">
                    Asistente en grupo de Líderes/Liderezas DEM
                  </Label>
                </div>

                <div>
                  <Label htmlFor="community_committee">Comité Comunitario</Label>
                  <Textarea
                    id="community_committee"
                    value={communityCommittee}
                    onChange={(e) => setCommunityCommittee(e.target.value)}
                    placeholder="Presidente: Nombre / Teléfono..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={status === 'activa' ? 'default' : 'outline'}
                    onClick={() => setStatus('activa')}
                    className={status === 'activa' ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'}
                  >
                    Activa
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={status === 'suspendida' ? 'default' : 'outline'}
                    onClick={() => setStatus('suspendida')}
                    className={status === 'suspendida' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300' : 'hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'}
                  >
                    Suspendida
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={status === 'inactiva' ? 'default' : 'outline'}
                    onClick={() => setStatus('inactiva')}
                    className={status === 'inactiva' ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-200'}
                  >
                    Inactiva
                  </Button>
                </div>

                {status === 'inactiva' && (
                  <div>
                    <Label htmlFor="inactive_reason">Motivo de Inactividad</Label>
                    <Textarea
                      id="inactive_reason"
                      value={inactiveReason}
                      onChange={(e) => setInactiveReason(e.target.value)}
                      placeholder="Describe por qué está inactiva..."
                      rows={2}
                    />
                  </div>
                )}

                {(status === 'suspendida' || status === 'inactiva') && (
                  <>
                    <div>
                      <Label htmlFor="termination_date">Fecha de Baja/Suspensión</Label>
                      <Input
                        id="termination_date"
                        type="date"
                        value={terminationDate}
                        onChange={(e) => setTerminationDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="termination_reason">Motivo de Suspensión o Baja</Label>
                      <Textarea
                        id="termination_reason"
                        value={terminationReason}
                        onChange={(e) => setTerminationReason(e.target.value)}
                        placeholder="Describe el motivo..."
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Familias */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Familias
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="total_families">Total de Familias</Label>
                    <Input
                      id="total_families"
                      type="number"
                      min="0"
                      value={totalFamilies}
                      onChange={(e) => setTotalFamilies(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="families_in_ra">Familias en RUA</Label>
                    <Input
                      id="families_in_ra"
                      type="number"
                      min="0"
                      value={familiesInRa}
                      onChange={(e) => setFamiliesInRa(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="classification">Clasificación</Label>
                    <select
                      id="classification"
                      value={classification}
                      onChange={(e) => setClassification(e.target.value as typeof classification)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Pequeña">Pequeña (1-50)</option>
                      <option value="Mediana">Mediana (51-150)</option>
                      <option value="Grande">Grande (&gt;150)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos Demográficos */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900">Datos Demográficos</h3>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2 text-sm font-medium">Rango de Edad</div>
                  <div className="text-sm font-medium text-center">Mujeres</div>
                  <div className="text-sm font-medium text-center">Hombres</div>

                  <div className="col-span-2 text-sm">Primera Infancia (0-2 años)</div>
                  <Input type="number" min="0" value={earlyChildhoodWomen} onChange={(e) => setEarlyChildhoodWomen(e.target.value)} placeholder="0" />
                  <Input type="number" min="0" value={earlyChildhoodMen} onChange={(e) => setEarlyChildhoodMen(e.target.value)} placeholder="0" />

                  <div className="col-span-2 text-sm">Niñez (3-5 años)</div>
                  <Input type="number" min="0" value={childhood35Women} onChange={(e) => setChildhood35Women(e.target.value)} placeholder="0" />
                  <Input type="number" min="0" value={childhood35Men} onChange={(e) => setChildhood35Men(e.target.value)} placeholder="0" />

                  <div className="col-span-2 text-sm">Jóvenes (6-10 años)</div>
                  <Input type="number" min="0" value={youth610Women} onChange={(e) => setYouth610Women(e.target.value)} placeholder="0" />
                  <Input type="number" min="0" value={youth610Men} onChange={(e) => setYouth610Men(e.target.value)} placeholder="0" />

                  <div className="col-span-2 text-sm">Adultos (11-18 años)</div>
                  <Input type="number" min="0" value={adults1118Women} onChange={(e) => setAdults1118Women(e.target.value)} placeholder="0" />
                  <Input type="number" min="0" value={adults1118Men} onChange={(e) => setAdults1118Men(e.target.value)} placeholder="0" />

                  <div className="col-span-2 text-sm">Adultos (19-60 años)</div>
                  <Input type="number" min="0" value={adults1960Women} onChange={(e) => setAdults1960Women(e.target.value)} placeholder="0" />
                  <Input type="number" min="0" value={adults1960Men} onChange={(e) => setAdults1960Men(e.target.value)} placeholder="0" />

                  <div className="col-span-2 text-sm">Adulto Mayor (61+ años)</div>
                  <Input type="number" min="0" value={seniors61PlusWomen} onChange={(e) => setSeniors61PlusWomen(e.target.value)} placeholder="0" />
                  <Input type="number" min="0" value={seniors61PlusMen} onChange={(e) => setSeniors61PlusMen(e.target.value)} placeholder="0" />

                  <div className="col-span-2 text-sm">Mujeres Gestantes</div>
                  <Input type="number" min="0" value={pregnantWomen} onChange={(e) => setPregnantWomen(e.target.value)} placeholder="0" />
                  <div></div>

                  <div className="col-span-2 text-sm">Mujeres Lactantes</div>
                  <Input type="number" min="0" value={lactatingWomen} onChange={(e) => setLactatingWomen(e.target.value)} placeholder="0" />
                  <div></div>
                </div>
              </div>

              {/* Otros Datos */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Otros Datos
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="placement_type">Tipo de Colocación</Label>
                    <Input
                      id="placement_type"
                      value={placementType}
                      onChange={(e) => setPlacementType(e.target.value)}
                      placeholder="Ej: Entrega, Colocación"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="has_whatsapp_group"
                        checked={hasWhatsappGroup}
                        onCheckedChange={setHasWhatsappGroup}
                      />
                      <Label htmlFor="has_whatsapp_group" className="cursor-pointer">
                        Grupo de WhatsApp
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="storage_capacity">Capacidad de Almacenamiento</Label>
                    <Input
                      id="storage_capacity"
                      value={storageCapacity}
                      onChange={(e) => setStorageCapacity(e.target.value)}
                      placeholder="Descripción..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="placement_methods">Formas de Colocación</Label>
                    <Input
                      id="placement_methods"
                      value={placementMethods}
                      onChange={(e) => setPlacementMethods(e.target.value)}
                      placeholder="BS, BA, C, B..."
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="photo_reference_url">Fotografía de Referencia (URL)</Label>
                    <Input
                      id="photo_reference_url"
                      type="url"
                      value={photoReferenceUrl}
                      onChange={(e) => setPhotoReferenceUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {loading ? 'Guardando...' : isEditMode ? 'Actualizar Comunidad' : 'Crear Comunidad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

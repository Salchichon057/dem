/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Community } from '@/lib/types/community'
import { toast } from 'sonner'
import { Search, MapPin, Users, ExternalLink } from 'lucide-react'

interface CommunityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CommunityForm({ open, onOpenChange, onSuccess }: CommunityFormProps) {
  const [loading, setLoading] = useState(false)
  const [allCommunities, setAllCommunities] = useState<Community[]>([])
  const [totalCommunities, setTotalCommunities] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<Set<string>>(new Set())
  const [communityData, setCommunityData] = useState<Map<string, Partial<Community>>>(new Map())
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Cargar comunidades con paginación
  useEffect(() => {
    if (open) {
      fetchCommunities()
    }
  }, [open, currentPage, searchTerm])

  // Reset a página 1 cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/communities?${params.toString()}`)
      if (!response.ok) throw new Error('Error al cargar comunidades')
      
      const data = await response.json()
      setAllCommunities(data.communities || [])
      setTotalCommunities(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar comunidades')
    } finally {
      setLoading(false)
    }
  }

  // Manejar selección de comunidad
  const handleCommunityToggle = (community: Community) => {
    const newSelected = new Set(selectedCommunityIds)
    const newData = new Map(communityData)

    if (newSelected.has(community.id)) {
      newSelected.delete(community.id)
      newData.delete(community.id)
    } else {
      newSelected.add(community.id)
      // Auto-completar datos desde la tabla communities
      newData.set(community.id, {
        id: community.id,
        department: community.department,
        municipality: community.municipality,
        villages: community.villages,
        hamlets_served: community.hamlets_served,
        hamlets_count: community.hamlets_count,
        google_maps_url: community.google_maps_url,
        leader_name: community.leader_name,
        leader_phone: community.leader_phone,
        community_committee: community.community_committee,
        status: community.status,
        total_families: community.total_families,
        families_in_ra: community.families_in_ra,
        photo_reference_url: community.photo_reference_url,
        termination_reason: community.termination_reason || '',
        inactive_reason: community.inactive_reason || ''
      })
    }

    setSelectedCommunityIds(newSelected)
    setCommunityData(newData)
  }

  // Actualizar estado de una comunidad seleccionada
  const updateCommunityStatus = (communityId: string, status: 'activa' | 'inactiva' | 'suspendida') => {
    const newData = new Map(communityData)
    const current = newData.get(communityId)
    if (current) {
      newData.set(communityId, { ...current, status })
    }
    setCommunityData(newData)
  }

  // Actualizar motivo de suspensión/baja
  const updateTerminationReason = (communityId: string, reason: string) => {
    const newData = new Map(communityData)
    const current = newData.get(communityId)
    if (current) {
      newData.set(communityId, { ...current, termination_reason: reason })
    }
    setCommunityData(newData)
  }

  // Guardar comunidades seleccionadas
  const handleSubmit = async () => {
    if (selectedCommunityIds.size === 0) {
      toast.warning('Selecciona al menos una comunidad')
      return
    }

    try {
      setLoading(true)

      // Crear vínculos en community_profile_links
      const response = await fetch('/api/community-profile-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          community_ids: Array.from(selectedCommunityIds),
          notes: 'Agregadas desde Perfil Comunitario'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al vincular comunidades')
      }

      const result = await response.json()

      toast.success(
        result.message || `${selectedCommunityIds.size} comunidad(es) vinculada(s) exitosamente`
      )
      onSuccess()
      onOpenChange(false)
      
      // Reset
      setSelectedCommunityIds(new Set())
      setCommunityData(new Map())
      setSearchTerm('')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar comunidades')
    } finally {
      setLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activa':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Activa</Badge>
      case 'suspendida':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Suspendida</Badge>
      case 'inactiva':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Inactiva</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Agregar Comunidades
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona las aldeas que deseas agregar al Perfil Comunitario
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Búsqueda y contador */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aldea, departamento o municipio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {totalCommunities} comunidades
            </div>
          </div>

          {/* Lista de comunidades con checkboxes */}
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : allCommunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron comunidades
              </div>
            ) : (
              <div className="space-y-3">
                {allCommunities.map((community) => {
                  const isSelected = selectedCommunityIds.has(community.id)
                  const data = communityData.get(community.id)

                  return (
                    <div
                      key={community.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Header con checkbox */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleCommunityToggle(community)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <h3 className="font-semibold text-lg">{community.villages || 'Sin nombre'}</h3>
                            </div>
                            {getStatusBadge(community.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Departamento:</span> {community.department}
                            </div>
                            <div>
                              <span className="font-medium">Municipio:</span> {community.municipality}
                            </div>
                            {community.hamlets_count && (
                              <div>
                                <span className="font-medium">Caseríos:</span> {community.hamlets_count}
                              </div>
                            )}
                            {community.total_families && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span className="font-medium">Familias:</span> {community.total_families}
                              </div>
                            )}
                            {community.leader_name && (
                              <div className="col-span-2">
                                <span className="font-medium">Líder:</span> {community.leader_name}
                                {community.leader_phone && ` / ${community.leader_phone}`}
                              </div>
                            )}
                          </div>

                          {/* Campos editables cuando está seleccionado */}
                          {isSelected && data && (
                            <div className="mt-4 space-y-3 border-t pt-3">
                              {/* Selector de estado */}
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Estado</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={data.status === 'activa' ? 'default' : 'outline'}
                                    onClick={() => updateCommunityStatus(community.id, 'activa')}
                                    className={data.status === 'activa' ? 'bg-green-500 hover:bg-green-600' : ''}
                                  >
                                    Activa
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={data.status === 'suspendida' ? 'default' : 'outline'}
                                    onClick={() => updateCommunityStatus(community.id, 'suspendida')}
                                    className={data.status === 'suspendida' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                                  >
                                    Suspendida
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={data.status === 'inactiva' ? 'default' : 'outline'}
                                    onClick={() => updateCommunityStatus(community.id, 'inactiva')}
                                    className={data.status === 'inactiva' ? 'bg-red-500 hover:bg-red-600' : ''}
                                  >
                                    Inactiva
                                  </Button>
                                </div>
                              </div>

                              {/* Motivo de suspensión/baja */}
                              {(data.status === 'suspendida' || data.status === 'inactiva') && (
                                <div>
                                  <Label htmlFor={`reason-${community.id}`} className="text-sm font-medium">
                                    Motivo de {data.status === 'suspendida' ? 'suspensión' : 'baja'}
                                  </Label>
                                  <Textarea
                                    id={`reason-${community.id}`}
                                    value={data.termination_reason || ''}
                                    onChange={(e) => updateTerminationReason(community.id, e.target.value)}
                                    placeholder="Ingresa el motivo..."
                                    className="mt-1"
                                    rows={2}
                                  />
                                </div>
                              )}

                              {/* Ubicación en Google Maps */}
                              {community.google_maps_url && (
                                <div>
                                  <a
                                    href={community.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Ver en Google Maps
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Paginación */}
          {!loading && allCommunities.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-2 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalCommunities)} de {totalCommunities}
              </div>
              
              <div className="flex items-center gap-1">
                {/* Primera página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-9"
                >
                  &laquo;
                </Button>
                
                {/* Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9"
                >
                  &lsaquo;
                </Button>
                
                {/* Números de página (solo 3) */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const startPage = Math.max(1, currentPage - 1)
                    const endPage = Math.min(totalPages, startPage + 2)
                    
                    const pages = []
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          className="w-9"
                        >
                          {i}
                        </Button>
                      )
                    }
                    return pages
                  })()}
                </div>
                
                {/* Siguiente */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9"
                >
                  &rsaquo;
                </Button>
                
                {/* Última página */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-9"
                >
                  &raquo;
                </Button>
              </div>
            </div>
          )}

          {/* Footer con botones */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedCommunityIds.size} comunidad(es) seleccionada(s)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedCommunityIds.size === 0}
                className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {loading ? 'Guardando...' : `Agregar ${selectedCommunityIds.size} comunidad(es)`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

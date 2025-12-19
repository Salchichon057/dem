"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { SECTION_GROUPS, SECTION_LABELS, type SectionKey } from '@/lib/types/permissions'

interface ManageSectionPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userRole: 'admin' | 'editor' | 'viewer'
  onSuccess?: () => void
}

export function ManageSectionPermissionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userRole,
  onSuccess
}: ManageSectionPermissionsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([])

  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/users/${userId}/section-permissions`)
        if (response.ok) {
          const data = await response.json()
          setSelectedSections(data.permissions.map((p: { section_key: SectionKey }) => p.section_key))
        }
      } catch (error) {
        console.error('Error loading permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (open && userId) {
      loadPermissions()
    }
  }, [open, userId])

  const handleToggleSection = (sectionKey: SectionKey) => {
    setSelectedSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(s => s !== sectionKey)
        : [...prev, sectionKey]
    )
  }

  const handleToggleGroup = (groupSections: readonly string[]) => {
    const allSelected = groupSections.every(s => selectedSections.includes(s as SectionKey))
    
    if (allSelected) {
      // Deselect all in group
      setSelectedSections(prev => prev.filter(s => !groupSections.includes(s)))
    } else {
      // Select all in group
      const newSections = groupSections.filter(s => !selectedSections.includes(s as SectionKey)) as SectionKey[]
      setSelectedSections(prev => [...prev, ...newSections])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/section-permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKeys: selectedSections })
      })

      if (response.ok) {
        onSuccess?.()
        onOpenChange(false)
      } else {
        console.error('Error saving permissions')
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
    } finally {
      setSaving(false)
    }
  }

  if (userRole === 'admin') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Secciones</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Los administradores tienen acceso completo a todas las secciones. No es necesario configurar permisos específicos.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Secciones - {userName}</DialogTitle>
          <p className="text-sm text-gray-600">
            Selecciona las secciones a las que {userName} ({userRole}) puede acceder
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {Object.entries(SECTION_GROUPS).map(([groupName, sections]) => {
              const allSelected = sections.every(s => selectedSections.includes(s as SectionKey))

              return (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id={`group-${groupName}`}
                      checked={allSelected}
                      onCheckedChange={() => handleToggleGroup(sections)}
                    />
                    <Label 
                      htmlFor={`group-${groupName}`}
                      className="font-semibold text-gray-900 cursor-pointer"
                    >
                      {groupName}
                    </Label>
                  </div>

                  <div className="ml-6 space-y-2">
                    {sections.map((sectionKey) => (
                      <div key={sectionKey} className="flex items-center space-x-2">
                        <Checkbox
                          id={sectionKey}
                          checked={selectedSections.includes(sectionKey as SectionKey)}
                          onCheckedChange={() => handleToggleSection(sectionKey as SectionKey)}
                        />
                        <Label 
                          htmlFor={sectionKey}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {SECTION_LABELS[sectionKey as SectionKey]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

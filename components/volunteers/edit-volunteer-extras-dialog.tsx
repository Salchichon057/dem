"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { volunteerExtrasSchema } from "@/lib/validators/volunteer-extras.validator"
import { z } from "zod"

interface VolunteerExtras {
  id?: string
  submission_id: string
  total_hours: number
  receives_benefit: boolean
  benefit_number: string | null
  agricultural_pounds: number
  unit_cost_q: number | null
  unit_cost_usd: number | null
  viveres_bags: number | null
  average_cost_30lbs: number | null
  picking_gtq: number | null
  picking_5lbs: number | null
  total_amount_q: number | null
  group_number: number | null
}

interface EditVolunteerExtrasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  onSaved: () => void
}

export function EditVolunteerExtrasDialog({
  open,
  onOpenChange,
  submissionId,
  onSaved,
}: EditVolunteerExtrasDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<VolunteerExtras>({
    submission_id: submissionId,
    total_hours: 0,
    receives_benefit: false,
    benefit_number: null,
    agricultural_pounds: 0,
    unit_cost_q: null,
    unit_cost_usd: null,
    viveres_bags: null,
    average_cost_30lbs: null,
    picking_gtq: null,
    picking_5lbs: null,
    total_amount_q: null,
    group_number: null,
  })

  useEffect(() => {
    if (open && submissionId) {
      fetchVolunteerExtras()
    }
  }, [open, submissionId])

  const fetchVolunteerExtras = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/volunteer-extras/${submissionId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setFormData(data)
        }
      } else if (response.status !== 404) {
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setErrors({})
      
      const validation = volunteerExtrasSchema.safeParse(formData)
      
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {}
        validation.error.issues.forEach((err: z.ZodIssue) => {
          const field = err.path[0] as string
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        toast.error('Por favor corrige los errores en el formulario')
        setSaving(false)
        return
      }
      
      const response = await fetch('/api/volunteer-extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Datos guardados correctamente')
        onSaved()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error('Error al guardar: ' + (error.error || 'Error desconocido'))
      }
    } catch {
      toast.error('Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  const handleNumberChange = (field: keyof VolunteerExtras, value: string) => {
    const parsed = value === '' ? null : parseFloat(value)
    setFormData({ ...formData, [field]: parsed })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campos Extras - Voluntariado</DialogTitle>
          <DialogDescription>
            Completa los campos adicionales para este registro de voluntariado
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="total_hours">Horas Totales *</Label>
              <Input
                id="total_hours"
                type="number"
                step="0.01"
                min="0"
                max="24"
                value={formData.total_hours || ""}
                onChange={(e) => handleNumberChange('total_hours', e.target.value)}
                className={errors.total_hours ? "border-red-500" : ""}
              />
              {errors.total_hours && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.total_hours}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receives_benefit">Recibe Beneficio?</Label>
              <Select
                value={formData.receives_benefit ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, receives_benefit: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit_number">Número de Beneficio</Label>
              <Input
                id="benefit_number"
                value={formData.benefit_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, benefit_number: e.target.value || null })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agricultural_pounds">Libras Agrícolas</Label>
              <Input
                id="agricultural_pounds"
                type="number"
                step="0.01"
                min="0"
                value={formData.agricultural_pounds || ""}
                onChange={(e) => handleNumberChange('agricultural_pounds', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_cost_q">Costo Unitario Q</Label>
                <Input
                  id="unit_cost_q"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost_q || ""}
                  onChange={(e) => handleNumberChange('unit_cost_q', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_cost_usd">Costo Unitario USD</Label>
                <Input
                  id="unit_cost_usd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost_usd || ""}
                  onChange={(e) => handleNumberChange('unit_cost_usd', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viveres_bags">Bolsas de Víveres</Label>
              <Input
                id="viveres_bags"
                type="number"
                step="1"
                min="0"
                value={formData.viveres_bags || ""}
                onChange={(e) => handleNumberChange('viveres_bags', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="average_cost_30lbs">Costo Promedio 30lbs</Label>
              <Input
                id="average_cost_30lbs"
                type="number"
                step="0.01"
                min="0"
                value={formData.average_cost_30lbs || ""}
                onChange={(e) => handleNumberChange('average_cost_30lbs', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="picking_gtq">Picking GTQ</Label>
                <Input
                  id="picking_gtq"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.picking_gtq || ""}
                  onChange={(e) => handleNumberChange('picking_gtq', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="picking_5lbs">Picking 5lbs</Label>
                <Input
                  id="picking_5lbs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.picking_5lbs || ""}
                  onChange={(e) => handleNumberChange('picking_5lbs', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount_q">Monto Total Q</Label>
              <Input
                id="total_amount_q"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount_q || ""}
                onChange={(e) => handleNumberChange('total_amount_q', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_number">Número de Grupo</Label>
              <Input
                id="group_number"
                type="number"
                step="1"
                min="1"
                value={formData.group_number || ""}
                onChange={(e) => handleNumberChange('group_number', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

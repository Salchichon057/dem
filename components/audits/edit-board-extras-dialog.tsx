/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { AUDITS_CONFIG, getTrafficLightBadgeClasses, getTrafficLightEmoji } from "@/lib/config/audits.config"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { boardExtrasSchema } from "@/lib/validators/board-extras.validator"
import { z } from "zod"

interface BoardExtras {
  id?: string
  submission_id: string
  traffic_light: string | null
  recommendations: string | null
  follow_up_given: string | null
  follow_up_date: string | null
  concluded_result_red_or_no: string | null
  solutions: string | null
  preliminary_report: string | null
  full_report: string | null
}

interface EditBoardExtrasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  onSaved: () => void
}

export function EditBoardExtrasDialog({
  open,
  onOpenChange,
  submissionId,
  onSaved,
}: EditBoardExtrasDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<BoardExtras>({
    submission_id: submissionId,
    traffic_light: null,
    recommendations: null,
    follow_up_given: null,
    follow_up_date: null,
    concluded_result_red_or_no: null,
    solutions: null,
    preliminary_report: null,
    full_report: null,
  })

  useEffect(() => {
    if (open && submissionId) {
      fetchBoardExtras()
    }
  }, [open, submissionId])

  const fetchBoardExtras = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/board-extras/${submissionId}`)
      
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
      
      // Validar con Zod
      const validation = boardExtrasSchema.safeParse(formData)
      
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
      
      const response = await fetch('/api/board-extras', {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campos Extras - Status de Hallazgos</DialogTitle>
          <DialogDescription>
            Completa los campos adicionales para este registro de auditoría
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Semáforo - Solo lectura */}
            <div className="space-y-2">
              <Label htmlFor="traffic_light">Semáforo (automático)</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                {formData.traffic_light ? (
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getTrafficLightBadgeClasses(formData.traffic_light)}`}>
                    {getTrafficLightEmoji(formData.traffic_light)} {formData.traffic_light}
                  </span>
                ) : (
                  <span className="text-gray-500">Sin definir</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                El semáforo se asigna automáticamente según la categoría del hallazgo
              </p>
            </div>

            {/* Recomendaciones */}
            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendaciones</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations || ""}
                onChange={(e) =>
                  setFormData({ ...formData, recommendations: e.target.value || null })
                }
                placeholder="Escribe las recomendaciones aquí..."
                rows={3}
              />
            </div>

            {/* Se dio seguimiento */}
            <div className="space-y-2">
              <Label htmlFor="follow_up_given">Se dio seguimiento?</Label>
              <Select
                value={formData.follow_up_given || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, follow_up_given: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No iniciado">No iniciado</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha del seguimiento */}
            <div className="space-y-2">
              <Label htmlFor="follow_up_date">Fecha del seguimiento</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={formData.follow_up_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, follow_up_date: e.target.value || null })
                }
              />
            </div>

            {/* Concluido (está resuelto o no) */}
            <div className="space-y-2">
              <Label htmlFor="concluded_result_red_or_no">
                Concluido (está resuelto o no)
              </Label>
              <Select
                value={formData.concluded_result_red_or_no || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, concluded_result_red_or_no: value || null })
                }
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUDITS_CONFIG.CONCLUDED_STATUS.YES}>{AUDITS_CONFIG.CONCLUDED_STATUS.YES}</SelectItem>
                  <SelectItem value={AUDITS_CONFIG.CONCLUDED_STATUS.NO}>{AUDITS_CONFIG.CONCLUDED_STATUS.NO}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Soluciones */}
            <div className="space-y-2">
              <Label htmlFor="solutions">Soluciones</Label>
              <Textarea
                id="solutions"
                value={formData.solutions || ""}
                onChange={(e) =>
                  setFormData({ ...formData, solutions: e.target.value || null })
                }
                placeholder="Escribe las soluciones aquí..."
                rows={3}
              />
            </div>

            {/* INFORME PRELIMINAR */}
            <div className="space-y-2">
              <Label htmlFor="preliminary_report">INFORME PRELIMINAR</Label>
              <Input
                id="preliminary_report"
                type="url"
                value={formData.preliminary_report || ""}
                onChange={(e) =>
                  setFormData({ ...formData, preliminary_report: e.target.value || null })
                }
                placeholder="https://ejemplo.com/informe-preliminar.pdf"
                className={errors.preliminary_report ? "border-red-500" : ""}
              />
              {errors.preliminary_report && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.preliminary_report}
                </p>
              )}
            </div>

            {/* Informe completo */}
            <div className="space-y-2">
              <Label htmlFor="full_report">Informe completo</Label>
              <Input
                id="full_report"
                type="url"
                value={formData.full_report || ""}
                onChange={(e) =>
                  setFormData({ ...formData, full_report: e.target.value || null })
                }
                placeholder="https://ejemplo.com/informe-completo.pdf"
                className={errors.full_report ? "border-red-500" : ""}
              />
              {errors.full_report && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.full_report}
                </p>
              )}
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


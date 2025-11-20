"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, Loader2, Eye, EyeOff, Trash2, RotateCcw, Archive } from "lucide-react"
import { ConfirmDialog } from "./confirm-dialog"

interface FormTemplate {
  id: string
  name: string
  section_location: string | null
  is_active: boolean
  deleted_at: string | null
  created_at: string
  created_by: string
  creator: {
    name: string
    email: string
  } | null
}

const SECTION_NAMES: Record<string, string> = {
  'organizaciones': 'Organizaciones',
  'auditorias': 'Auditorías',
  'perfil-comunitario': 'Perfil Comunitario',
  'voluntariado': 'Voluntariado',
  'comunidades': 'Comunidades',
  'abrazando-leyendas': 'Abrazando Leyendas'
}

export function AdminFormsSection() {
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<'active' | 'inactive' | 'deleted'>('active')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; form: FormTemplate | null }>({ open: false, form: null })
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; form: FormTemplate | null }>({ open: false, form: null })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select(`
          id,
          name,
          section_location,
          is_active,
          deleted_at,
          created_at,
          created_by,
          creator:users!inner(name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        const formsWithCreator: FormTemplate[] = data.map((form: Record<string, unknown>) => ({
          ...form,
          creator: Array.isArray(form.creator) ? form.creator[0] : form.creator
        })) as FormTemplate[]
        setForms(formsWithCreator)
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (formId: string, currentStatus: boolean) => {
    const supabase = createClient()
    setUpdating(formId)

    try {
      const { error } = await supabase
        .from('form_templates')
        .update({ is_active: !currentStatus })
        .eq('id', formId)

      if (error) throw error
      await fetchForms()
    } catch (error) {
      console.error('Error toggling active:', error)
      alert('Error al cambiar visibilidad')
    } finally {
      setUpdating(null)
    }
  }

  const confirmSoftDelete = async () => {
    if (!deleteDialog.form) return

    const supabase = createClient()
    setUpdating(deleteDialog.form.id)

    try {
      const { error } = await supabase
        .from('form_templates')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', deleteDialog.form.id)

      if (error) throw error
      await fetchForms()
      setDeleteDialog({ open: false, form: null })
    } catch (error) {
      console.error('Error soft deleting:', error)
      alert('Error al eliminar formulario')
    } finally {
      setUpdating(null)
    }
  }

  const confirmRestore = async () => {
    if (!restoreDialog.form) return

    const supabase = createClient()
    setUpdating(restoreDialog.form.id)

    try {
      const { error } = await supabase
        .from('form_templates')
        .update({ deleted_at: null, is_active: true })
        .eq('id', restoreDialog.form.id)

      if (error) throw error
      await fetchForms()
      setRestoreDialog({ open: false, form: null })
    } catch (error) {
      console.error('Error restoring:', error)
      alert('Error al restaurar formulario')
    } finally {
      setUpdating(null)
    }
  }

  const getFilteredForms = () => {
    switch (currentTab) {
      case 'active':
        return forms.filter(f => !f.deleted_at && f.is_active)
      case 'inactive':
        return forms.filter(f => !f.deleted_at && !f.is_active)
      case 'deleted':
        return forms.filter(f => f.deleted_at !== null)
      default:
        return forms
    }
  }

  const filteredForms = getFilteredForms()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Formularios</h3>
          <p className="text-sm text-gray-600">Controla visibilidad y estado de formularios</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {forms.length} formularios totales
        </Badge>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'active' | 'inactive' | 'deleted')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="space-x-2">
            <Eye className="w-4 h-4" />
            <span>Activos ({forms.filter(f => !f.deleted_at && f.is_active).length})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="space-x-2">
            <EyeOff className="w-4 h-4" />
            <span>Inactivos ({forms.filter(f => !f.deleted_at && !f.is_active).length})</span>
          </TabsTrigger>
          <TabsTrigger value="deleted" className="space-x-2">
            <Archive className="w-4 h-4" />
            <span>Eliminados ({forms.filter(f => f.deleted_at).length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-4">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Formulario</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead>Creador</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No hay formularios en esta categoría
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForms.map((form) => {
                    const isUpdating = updating === form.id
                    const isDeleted = form.deleted_at !== null

                    return (
                      <TableRow key={form.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span>{form.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {form.section_location ? SECTION_NAMES[form.section_location] || form.section_location : 'Sin sección'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {form.creator?.name || form.creator?.email || 'Desconocido'}
                        </TableCell>
                        <TableCell>
                          {isDeleted ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <Archive className="w-3 h-3 mr-1" />
                              Eliminado
                            </Badge>
                          ) : form.is_active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Eye className="w-3 h-3 mr-1" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!isDeleted && (
                            <Switch
                              checked={form.is_active}
                              onCheckedChange={() => handleToggleActive(form.id, form.is_active)}
                              disabled={isUpdating}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {isDeleted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoreDialog({ open: true, form })}
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-700"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Restaurar
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, form })}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Eliminar
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-800">
          <strong>Estados de formularios:</strong>
        </p>
        <ul className="text-sm text-blue-700 space-y-1 ml-4">
          <li><strong>Activo:</strong> Visible para usuarios, pueden enviar respuestas</li>
          <li><strong>Inactivo:</strong> Oculto, no aparece en el dashboard de usuarios</li>
          <li><strong>Eliminado:</strong> Soft delete, puede restaurarse desde Papelera</li>
        </ul>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, form: null })}
        title="Eliminar Formulario"
        description={`¿Eliminar "${deleteDialog.form?.name}"? El formulario se ocultará pero las respuestas existentes se conservarán. Podrás restaurarlo desde la pestaña "Eliminados".`}
        confirmText="Eliminar"
        onConfirm={confirmSoftDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={restoreDialog.open}
        onOpenChange={(open) => !open && setRestoreDialog({ open: false, form: null })}
        title="Restaurar Formulario"
        description={`¿Restaurar "${restoreDialog.form?.name}"? El formulario volverá a estar activo y visible para los usuarios.`}
        confirmText="Restaurar"
        onConfirm={confirmRestore}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { X, Globe, Lock, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authFetch } from '@/lib/auth-fetch'
import { toast } from 'sonner'

interface PublicFormConfigModalProps {
  isOpen: boolean
  onClose: () => void
  formId: string
  formName: string
  isPublic: boolean
  slug: string
  onUpdate: (isPublic: boolean) => void
}

export default function PublicFormConfigModal({
  isOpen,
  onClose,
  formId,
  formName,
  isPublic: initialIsPublic,
  slug,
  onUpdate
}: PublicFormConfigModalProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Sincronizar el estado local cuando cambia el prop isPublic
  useEffect(() => {
    setIsPublic(initialIsPublic)
  }, [initialIsPublic, isOpen])

  if (!isOpen) return null

  const publicUrl = `${window.location.origin}/form/${slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error al copiar el enlace')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await authFetch(`/api/formularios/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_public: isPublic
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar')
      }

      onUpdate(isPublic)
      toast.success(
        isPublic 
          ? 'Formulario ahora es público' 
          : 'Formulario ahora es privado'
      )
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al actualizar formulario'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPublic ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isPublic ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Configuración de Acceso
              </h2>
              <p className="text-sm text-gray-500">{formName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Toggle Público/Privado */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Visibilidad del Formulario
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción Público */}
              <button
                onClick={() => setIsPublic(true)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  ${isPublic 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <Globe className={`w-6 h-6 ${isPublic ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-center">
                  <p className={`text-sm font-medium ${isPublic ? 'text-green-900' : 'text-gray-700'}`}>
                    Público
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sin autenticación
                  </p>
                </div>
              </button>

              {/* Opción Privado */}
              <button
                onClick={() => setIsPublic(false)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  ${!isPublic 
                    ? 'border-gray-600 bg-gray-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <Lock className={`w-6 h-6 ${!isPublic ? 'text-gray-700' : 'text-gray-400'}`} />
                <div className="text-center">
                  <p className={`text-sm font-medium ${!isPublic ? 'text-gray-900' : 'text-gray-700'}`}>
                    Privado
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo dashboard
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Enlace Público (solo si es público) */}
          {isPublic && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enlace Público
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-default focus:outline-none"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="shrink-0 px-3"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Este enlace puede ser compartido con cualquier persona
              </p>
            </div>
          )}

          {/* Descripción del estado actual */}
          <div className={`p-3 rounded-lg ${isPublic ? 'bg-green-50' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-700">
              {isPublic ? (
                <>
                  <span className="font-medium text-green-700">Formulario público:</span>
                  {' '}Cualquier persona con el enlace podrá llenar este formulario sin necesidad de iniciar sesión.
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-700">Formulario privado:</span>
                  {' '}Solo usuarios autenticados en el dashboard podrán acceder a este formulario.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useCallback } from 'react'
import { uploadFormFile, deleteFile, getFileUrl } from '@/lib/storage/handler'
import { createClient } from '@/lib/supabase/client'

/**
 * Tipo de sección de formulario para determinar el bucket
 */
export type FormSection = 
  | 'FORM_ABRAZANDO_LEYENDAS'
  | 'FORM_COMUNIDADES'
  | 'FORM_AUDITORIAS'
  | 'FORM_ORGANIZACIONES'
  | 'FORM_PERFIL_COMUNITARIO'
  | 'FORM_VOLUNTARIADO'

/**
 * Archivo subido con metadata
 */
export interface UploadedFile {
  id: string // ID único generado localmente
  file: File // Archivo original
  relativePath?: string // Path relativo en el storage (una vez subido)
  publicUrl?: string // URL pública (una vez subido)
  progress: number // Progreso de subida (0-100)
  error?: string // Error si hubo problema
  status: 'pending' | 'uploading' | 'success' | 'error'
}

/**
 * Opciones para el hook
 */
export interface UseFileUploadOptions {
  formSection: FormSection
  submissionId: string
  maxFiles?: number // Máximo de archivos permitidos
  maxSizeMB?: number // Tamaño máximo por archivo en MB
  acceptedTypes?: string[] // Tipos MIME aceptados
  onSuccess?: (files: UploadedFile[]) => void
  onError?: (error: string) => void
}

/**
 * Hook para manejar subida de archivos en formularios
 * Maneja validación, preview, progreso, y múltiples archivos
 */
export function useFileUpload(options: UseFileUploadOptions) {
  const {
    formSection,
    submissionId,
    maxFiles = 5,
    maxSizeMB = 10,
    acceptedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ],
    onSuccess,
    onError,
  } = options

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  /**
   * Valida un archivo antes de subirlo
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Validar tamaño
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        return `El archivo "${file.name}" excede el tamaño máximo de ${maxSizeMB}MB`
      }

      // Validar tipo
      if (!acceptedTypes.includes(file.type)) {
        return `El tipo de archivo "${file.type}" no es permitido`
      }

      return null
    },
    [maxSizeMB, acceptedTypes]
  )

  /**
   * Agrega archivos para subir (sin subirlos aún)
   */
  const addFiles = useCallback(
    (newFiles: File[]) => {
      // Validar límite de archivos
      if (files.length + newFiles.length > maxFiles) {
        const error = `Solo puedes subir máximo ${maxFiles} archivo(s)`
        onError?.(error)
        return
      }

      // Validar cada archivo y crear objetos UploadedFile
      const validatedFiles: UploadedFile[] = []
      for (const file of newFiles) {
        const validationError = validateFile(file)
        
        if (validationError) {
          onError?.(validationError)
          continue
        }

        validatedFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          file,
          progress: 0,
          status: 'pending',
        })
      }

      setFiles(prev => [...prev, ...validatedFiles])
    },
    [files.length, maxFiles, validateFile, onError]
  )

  /**
   * Sube todos los archivos pendientes al storage
   */
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Subir cada archivo
      const uploadPromises = pendingFiles.map(async (uploadedFile) => {
        try {
          // Actualizar estado a "uploading"
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, status: 'uploading' as const, progress: 10 }
                : f
            )
          )

          // Subir archivo
          const relativePath = await uploadFormFile(
            uploadedFile.file,
            formSection,
            user.id,
            submissionId
          )

          // Obtener URL pública
          const publicUrl = getFileUrl(relativePath)

          // Actualizar estado a "success"
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? {
                    ...f,
                    relativePath,
                    publicUrl,
                    progress: 100,
                    status: 'success' as const,
                  }
                : f
            )
          )

          return { ...uploadedFile, relativePath, publicUrl, status: 'success' as const }
        } catch (err) {
          // Actualizar estado a "error"
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? {
                    ...f,
                    error: err instanceof Error ? err.message : 'Error al subir archivo',
                    status: 'error' as const,
                  }
                : f
            )
          )

          throw err
        }
      })

      await Promise.all(uploadPromises)

      const successFiles = files.filter(f => f.status === 'success')
      onSuccess?.(successFiles)
    } catch (err) {
      const errorMsg = `Error al subir archivos: ${err instanceof Error ? err.message : 'Error desconocido'}`
      onError?.(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }, [files, formSection, submissionId, supabase, onSuccess, onError])

  /**
   * Elimina un archivo de la lista (y del storage si ya fue subido)
   */
  const removeFile = useCallback(
    async (fileId: string) => {
      const fileToRemove = files.find(f => f.id === fileId)
      if (!fileToRemove) return

      // Si el archivo ya fue subido, eliminarlo del storage
      if (fileToRemove.relativePath) {
        try {
          await deleteFile(fileToRemove.relativePath)
        } catch {
        }
      }

      // Eliminar de la lista local
      setFiles(prev => prev.filter(f => f.id !== fileId))
    },
    [files]
  )

  /**
   * Limpia todos los archivos
   */
  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  /**
   * Obtiene solo los archivos exitosamente subidos con sus paths
   */
  const getSuccessfulUploads = useCallback((): string[] => {
    return files
      .filter(f => f.status === 'success' && f.relativePath)
      .map(f => f.relativePath!)
  }, [files])

  return {
    files,
    isUploading,
    addFiles,
    uploadFiles,
    removeFile,
    clearFiles,
    getSuccessfulUploads,
  }
}


/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/client'

/**
 * Storage Handler Singleton
 * Maneja el upload/download de archivos de forma agnóstica al proveedor
 * Usa paths relativos para facilitar migración a S3, Azure Blob u otro storage
 */

// Nombres de buckets según sección
export const STORAGE_BUCKETS = {
  BENEFICIARIES: 'beneficiaries-photos',
  FORM_ABRAZANDO_LEYENDAS: 'form-abrazando-leyendas',
  FORM_COMUNIDADES: 'form-comunidades',
  FORM_AUDITORIAS: 'form-auditorias',
  FORM_ORGANIZACIONES: 'form-organizaciones',
  FORM_PERFIL_COMUNITARIO: 'form-perfil-comunitario',
  FORM_VOLUNTARIADO: 'form-voluntariado',
} as const

type BucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// Base URL del storage provider (configurable vía .env)
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ''

/**
 * Genera un nombre de archivo único y trazable
 * Formato: {userId}_{resourceType}_{resourceId}_{timestamp}_{hash}.{ext}
 * Ejemplo: abc123_form_xyz789_1700000000000_a1b2c3.jpg
 */
export function generateUniqueFileName(
  userId: string,
  resourceType: 'form' | 'beneficiary' | 'volunteer' | 'submission' | 'profile',
  resourceId: string,
  originalFileName: string
): string {
  const timestamp = Date.now()
  const randomHash = Math.random().toString(36).substring(2, 8)
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg'
  
  return `${userId}_${resourceType}_${resourceId}_${timestamp}_${randomHash}.${extension}`
}

class StorageHandler {
  private static instance: StorageHandler
  private supabase = createClient()

  private constructor() {}

  static getInstance(): StorageHandler {
    if (!StorageHandler.instance) {
      StorageHandler.instance = new StorageHandler()
    }
    return StorageHandler.instance
  }

  /**
   * Sube un archivo y retorna el path relativo puro (sin storage URL)
   * @param file - Archivo a subir
   * @param bucket - Nombre del bucket (usa STORAGE_BUCKETS)
   * @param userId - ID del usuario que sube el archivo
   * @param resourceType - Tipo de recurso ('form', 'beneficiary', 'volunteer', etc.)
   * @param resourceId - ID del recurso (formulario, beneficiario, etc.)
   * @returns Path relativo puro ej: "form-comunidades/abc123_form_xyz789_1700000000000_a1b2c3.jpg"
   */
  async uploadFile(
    file: File,
    bucket: BucketName,
    userId: string,
    resourceType: 'form' | 'beneficiary' | 'volunteer' | 'submission' | 'profile',
    resourceId: string
  ): Promise<string> {
    try {
      // Validar tamaño (máx 10MB para archivos, 5MB para imágenes)
      const isImage = file.type.startsWith('image/')
      const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error(`El archivo no puede exceder ${isImage ? '5MB' : '10MB'}`)
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido')
      }

      // Generar nombre único y trazable
      const fileName = generateUniqueFileName(userId, resourceType, resourceId, file.name)

      // Upload a Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Retornar SOLO el path relativo (sin storage URL)
      // Formato: "bucket-name/fileName"
      const relativePath = `${bucket}/${fileName}`
      return relativePath
    } catch {
      throw new Error(`Error al subir archivo`)
    }
  }

  /**
   * Obtiene la URL pública completa de un archivo desde su path relativo
   * @param relativePath - Path relativo ej: "bucket-name/userId_form_id_timestamp_hash.jpg"
   * @returns URL pública completa del storage provider
   */
  getPublicUrl(relativePath: string): string {
    if (!relativePath) return ''
    
    // Si ya es una URL completa, retornarla
    if (relativePath.startsWith('http')) return relativePath
    
    // Si no hay base URL configurada, usar método de Supabase
    if (!STORAGE_BASE_URL) {
      // Extraer bucket y path
      const parts = relativePath.split('/')
      if (parts.length < 2) return ''
      
      const bucket = parts[0]
      const filePath = parts.slice(1).join('/')
      
      const { data } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)
      
      return data.publicUrl
    }

    // Usar base URL configurada (agnóstico del proveedor)
    // Formato: STORAGE_BASE_URL/relativePath
    const cleanPath = relativePath.replace(/^\/+/, '') // Remover slashes iniciales
    return `${STORAGE_BASE_URL}/${cleanPath}`
  }

  /**
   * Elimina un archivo del storage
   * @param relativePath - Path relativo ej: "bucket-name/userId_form_id_timestamp_hash.jpg"
   */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      if (!relativePath) return
      
      // Extraer bucket y path
      const parts = relativePath.split('/')
      if (parts.length < 2) {
        throw new Error('Path relativo inválido')
      }
      
      const bucket = parts[0]
      const filePath = parts.slice(1).join('/')

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error
    } catch {
      throw new Error(`Error al eliminar archivo`)
    }
  }

  /**
   * Reemplaza un archivo (elimina el anterior y sube uno nuevo)
   * @param oldPath - Path relativo del archivo anterior
   * @param newFile - Nuevo archivo a subir
   * @param bucket - Nombre del bucket
   * @param userId - ID del usuario
   * @param resourceType - Tipo de recurso
   * @param resourceId - ID del recurso
   * @returns Nuevo path relativo
   */
  async replaceFile(
    oldPath: string,
    newFile: File,
    bucket: BucketName,
    userId: string,
    resourceType: 'form' | 'beneficiary' | 'volunteer' | 'submission' | 'profile',
    resourceId: string
  ): Promise<string> {
    try {
      // Subir nuevo archivo
      const newPath = await this.uploadFile(newFile, bucket, userId, resourceType, resourceId)
      
      // Eliminar archivo anterior (si existe)
      if (oldPath) {
        await this.deleteFile(oldPath).catch(err => {
        })
      }
      
      return newPath
    } catch {
      throw new Error(`Error al reemplazar archivo`)
    }
  }

  /**
   * Verifica si un bucket existe, si no lo crea
   * @param bucketName - Nombre del bucket a verificar/crear
   */
  async ensureBucketExists(bucketName: BucketName): Promise<void> {
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === bucketName)

      if (!bucketExists) {
        const { error } = await this.supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (error) throw error
      }
    } catch {
      // No lanzar error, solo loggear
    }
  }

  /**
   * Crea todos los buckets necesarios para el sistema
   */
  async ensureAllBucketsExist(): Promise<void> {
    const buckets = Object.values(STORAGE_BUCKETS)
    await Promise.all(buckets.map(bucket => this.ensureBucketExists(bucket)))
  }
}

// Export singleton instance
export const storageHandler = StorageHandler.getInstance()

// ============================================
// Helper functions para usar directamente
// ============================================

/**
 * Sube una foto para beneficiarios
 * @param file - Archivo de imagen
 * @param userId - ID del usuario que sube la foto
 * @param beneficiaryId - ID del beneficiario
 * @returns Path relativo del archivo
 */
export const uploadBeneficiaryPhoto = (file: File, userId: string, beneficiaryId: string) => 
  storageHandler.uploadFile(file, STORAGE_BUCKETS.BENEFICIARIES, userId, 'beneficiary', beneficiaryId)

/**
 * Sube un archivo en un formulario (genérico)
 * @param file - Archivo a subir
 * @param formSection - Sección del formulario (determina el bucket)
 * @param userId - ID del usuario que sube el archivo
 * @param submissionId - ID del submission del formulario
 * @returns Path relativo del archivo
 */
export const uploadFormFile = (
  file: File,
  formSection: 'FORM_ABRAZANDO_LEYENDAS' | 'FORM_COMUNIDADES' | 'FORM_AUDITORIAS' | 'FORM_ORGANIZACIONES' | 'FORM_PERFIL_COMUNITARIO' | 'FORM_VOLUNTARIADO',
  userId: string,
  submissionId: string
) => {
  const bucket = STORAGE_BUCKETS[formSection]
  const result = storageHandler.uploadFile(file, bucket, userId, 'submission', submissionId)
  return result
}

/**
 * Obtiene URL pública completa de un archivo
 * @param relativePath - Path relativo (ej: "bucket-name/userId_form_id_timestamp_hash.jpg")
 * @returns URL pública completa
 */
export const getFileUrl = (relativePath: string) => 
  storageHandler.getPublicUrl(relativePath)

/**
 * Elimina un archivo del storage
 * @param relativePath - Path relativo del archivo
 */
export const deleteFile = (relativePath: string) => 
  storageHandler.deleteFile(relativePath)

/**
 * Reemplaza una foto de beneficiario
 * @param oldPath - Path relativo de la foto anterior
 * @param newFile - Nueva foto
 * @param userId - ID del usuario
 * @param beneficiaryId - ID del beneficiario
 * @returns Nuevo path relativo
 */
export const replaceBeneficiaryPhoto = (oldPath: string, newFile: File, userId: string, beneficiaryId: string) => 
  storageHandler.replaceFile(oldPath, newFile, STORAGE_BUCKETS.BENEFICIARIES, userId, 'beneficiary', beneficiaryId)

/**
 * Crea todos los buckets necesarios
 */
export const ensureAllBucketsExist = () => 
  storageHandler.ensureAllBucketsExist()



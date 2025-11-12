/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/client'

/**
 * Storage Handler Singleton
 * Maneja el upload/download de archivos (principalmente fotos)
 * Usa paths relativos para facilitar migración a otro storage
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

const PUBLIC_URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

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
   * Sube una foto y retorna el path relativo
   * @param file - Archivo a subir
   * @param bucket - Nombre del bucket (usa STORAGE_BUCKETS)
   * @param folder - Carpeta dentro del bucket (ej: "beneficiaries", "submissions")
   * @param id - ID del recurso (opcional, para nombrar archivo como {id}-{type}.ext)
   * @param type - Tipo de archivo (ej: "beneficiary", "photo", "document")
   * @returns Path relativo ej: "/photos/beneficiaries/uuid-beneficiary.jpg"
   */
  async uploadPhoto(
    file: File, 
    bucket: BucketName = STORAGE_BUCKETS.BENEFICIARIES,
    folder: string = 'beneficiaries', 
    id?: string,
    type: string = 'photo'
  ): Promise<string> {
    try {
      // Validar tamaño (máx 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo no puede exceder 5MB')
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes (JPEG, PNG, WebP)')
      }

      // Generar nombre único con formato {id}-{type}.{extension}
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const uniqueId = id || `${Date.now()}-${Math.random().toString(36).substring(7)}`
      const fileName = `${uniqueId}-${type}.${extension}`
      const filePath = `${folder}/${fileName}`

      // Upload a Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Retornar path relativo con bucket incluido
      return `/storage/${bucket}/${filePath}`
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      throw new Error(`Error al subir foto: ${error.message}`)
    }
  }

  /**
   * Obtiene la URL pública de una foto desde el path relativo
   * @param relativePath - Path relativo ej: "/storage/bucket-name/folder/file.jpg"
   * @returns URL pública completa
   */
  getPublicUrl(relativePath: string): string {
    if (!relativePath) return ''
    
    // Si ya es una URL completa, retornarla
    if (relativePath.startsWith('http')) return relativePath
    
    // Extraer bucket y path del formato: /storage/{bucket}/{path}
    const match = relativePath.match(/^\/storage\/([^/]+)\/(.+)$/)
    if (!match) {
      // Formato antiguo, usar bucket por defecto
      const cleanPath = relativePath.replace(/^\/photos\//, '')
      const { data } = this.supabase.storage
        .from(STORAGE_BUCKETS.BENEFICIARIES)
        .getPublicUrl(cleanPath)
      return data.publicUrl
    }

    const [, bucket, path] = match
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  /**
   * Elimina una foto del storage
   * @param relativePath - Path relativo ej: "/storage/bucket-name/folder/file.jpg"
   */
  async deletePhoto(relativePath: string): Promise<void> {
    try {
      if (!relativePath) return
      
      // Extraer bucket y path
      const match = relativePath.match(/^\/storage\/([^/]+)\/(.+)$/)
      if (!match) {
        // Formato antiguo
        const cleanPath = relativePath.replace(/^\/photos\//, '')
        const { error } = await this.supabase.storage
          .from(STORAGE_BUCKETS.BENEFICIARIES)
          .remove([cleanPath])
        if (error) throw error
        return
      }

      const [, bucket, path] = match
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting photo:', error)
      throw new Error(`Error al eliminar foto: ${error.message}`)
    }
  }

  /**
   * Reemplaza una foto (elimina la anterior y sube una nueva)
   * @param oldPath - Path relativo de la foto anterior
   * @param newFile - Nueva foto a subir
   * @param bucket - Nombre del bucket
   * @param folder - Carpeta destino
   * @param id - ID del recurso (opcional)
   * @param type - Tipo de archivo
   * @returns Nuevo path relativo
   */
  async replacePhoto(
    oldPath: string, 
    newFile: File, 
    bucket: BucketName = STORAGE_BUCKETS.BENEFICIARIES,
    folder: string = 'beneficiaries', 
    id?: string,
    type: string = 'photo'
  ): Promise<string> {
    try {
      // Subir nueva foto
      const newPath = await this.uploadPhoto(newFile, bucket, folder, id, type)
      
      // Eliminar foto anterior (si existe)
      if (oldPath) {
        await this.deletePhoto(oldPath).catch(err => {
          console.warn('No se pudo eliminar foto anterior:', err)
        })
      }
      
      return newPath
    } catch (error: any) {
      console.error('Error replacing photo:', error)
      throw new Error(`Error al reemplazar foto: ${error.message}`)
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
        console.log(`Bucket '${bucketName}' creado exitosamente`)
      }
    } catch (error: any) {
      console.error(`Error ensuring bucket '${bucketName}' exists:`, error)
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

// Helper functions para usar directamente

/**
 * Sube una foto para beneficiarios
 */
export const uploadBeneficiaryPhoto = (file: File, id?: string) => 
  storageHandler.uploadPhoto(file, STORAGE_BUCKETS.BENEFICIARIES, 'photos', id, 'beneficiary')

/**
 * Sube una foto en un formulario (genérico)
 */
export const uploadFormPhoto = (file: File, formSection: keyof typeof STORAGE_BUCKETS, id?: string) => {
  const bucket = STORAGE_BUCKETS[formSection]
  return storageHandler.uploadPhoto(file, bucket, 'submissions', id, 'photo')
}

/**
 * Obtiene URL pública de una foto
 */
export const getPhotoUrl = (relativePath: string) => 
  storageHandler.getPublicUrl(relativePath)

/**
 * Elimina una foto
 */
export const deletePhoto = (relativePath: string) => 
  storageHandler.deletePhoto(relativePath)

/**
 * Reemplaza una foto de beneficiario
 */
export const replaceBeneficiaryPhoto = (oldPath: string, newFile: File, id?: string) => 
  storageHandler.replacePhoto(oldPath, newFile, STORAGE_BUCKETS.BENEFICIARIES, 'photos', id, 'beneficiary')

/**
 * Crea todos los buckets necesarios
 */
export const ensureAllBucketsExist = () => 
  storageHandler.ensureAllBucketsExist()


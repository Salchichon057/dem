/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase/client'

/**
 * Storage Handler Singleton
 * Maneja el upload/download de archivos (principalmente fotos)
 * Usa paths relativos para facilitar migración a otro storage
 */

const BUCKET_NAME = 'beneficiaries-photos'
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
   * @param folder - Carpeta dentro del bucket (ej: "beneficiaries")
   * @returns Path relativo ej: "/photos/beneficiaries/uuid.jpg"
   */
  async uploadPhoto(file: File, folder: string = 'beneficiaries'): Promise<string> {
    try {
      // Generar nombre único
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const extension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${extension}`
      const filePath = `${folder}/${fileName}`

      // Upload a Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Retornar path relativo
      return `/photos/${filePath}`
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      throw new Error(`Error al subir foto: ${error.message}`)
    }
  }

  /**
   * Obtiene la URL pública de una foto desde el path relativo
   * @param relativePath - Path relativo ej: "/photos/beneficiaries/uuid.jpg"
   * @returns URL pública completa
   */
  getPublicUrl(relativePath: string): string {
    if (!relativePath) return ''
    
    // Si ya es una URL completa, retornarla
    if (relativePath.startsWith('http')) return relativePath
    
    // Remover el prefijo /photos/ si existe
    const cleanPath = relativePath.replace(/^\/photos\//, '')
    
    const { data } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(cleanPath)
    
    return data.publicUrl
  }

  /**
   * Elimina una foto del storage
   * @param relativePath - Path relativo ej: "/photos/beneficiaries/uuid.jpg"
   */
  async deletePhoto(relativePath: string): Promise<void> {
    try {
      if (!relativePath) return
      
      // Remover el prefijo /photos/ si existe
      const cleanPath = relativePath.replace(/^\/photos\//, '')
      
      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove([cleanPath])

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
   * @param folder - Carpeta destino
   * @returns Nuevo path relativo
   */
  async replacePhoto(oldPath: string, newFile: File, folder: string = 'beneficiaries'): Promise<string> {
    try {
      // Subir nueva foto
      const newPath = await this.uploadPhoto(newFile, folder)
      
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
   * Verifica si el bucket existe, si no lo crea
   */
  async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)

      if (!bucketExists) {
        const { error } = await this.supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (error) throw error
        console.log(`Bucket '${BUCKET_NAME}' creado exitosamente`)
      }
    } catch (error: any) {
      console.error('Error ensuring bucket exists:', error)
      // No lanzar error, solo loggear
    }
  }
}

// Export singleton instance
export const storageHandler = StorageHandler.getInstance()

// Helper functions para usar directamente
export const uploadPhoto = (file: File, folder?: string) => 
  storageHandler.uploadPhoto(file, folder)

export const getPhotoUrl = (relativePath: string) => 
  storageHandler.getPublicUrl(relativePath)

export const deletePhoto = (relativePath: string) => 
  storageHandler.deletePhoto(relativePath)

export const replacePhoto = (oldPath: string, newFile: File, folder?: string) => 
  storageHandler.replacePhoto(oldPath, newFile, folder)

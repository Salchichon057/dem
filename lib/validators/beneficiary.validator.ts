/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'

// Esquema para crear un beneficiario (todos los campos requeridos)
export const createBeneficiarySchema = z.object({
  // Información Personal
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),

  age: z.number()
    .int('La edad debe ser un número entero')
    .min(1, 'La edad debe ser al menos 1')
    .max(120, 'La edad no puede exceder 120 años'),

  gender: z.enum(['Masculino', 'Femenino'], {
    message: 'El género debe ser Masculino o Femenino'
  }),

  dpi: z.string()
    .regex(/^\d{13}$/, 'El DPI debe tener exactamente 13 dígitos numéricos')
    .optional()
    .or(z.literal('')),

  // Información del Programa
  program: z.string()
    .min(1, 'El programa es requerido'),

  admission_date: z.string()
    .refine((date) => {
      const admissionDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return admissionDate <= today
    }, 'La fecha de ingreso no puede ser futura'),

  is_active: z.boolean()
    .default(true),

  // Ubicación
  department: z.string()
    .min(1, 'El departamento es requerido'),

  municipality: z.string()
    .min(1, 'El municipio es requerido'),

  village: z.string()
    .max(100, 'El nombre de la aldea no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .optional()
    .or(z.literal('')),

  google_maps_url: z.string()
    .url('Debe ser una URL válida')
    .refine(
      (url) => {
        const lowerUrl = url.toLowerCase()
        return lowerUrl.includes('google.com/maps') || 
               lowerUrl.includes('maps.google.com') || 
               lowerUrl.includes('goo.gl') || 
               lowerUrl.includes('maps.app.goo.gl')
      },
      'Debe ser una URL válida de Google Maps (que contenga google.com/maps, maps.google.com, goo.gl o maps.app.goo.gl)'
    )
    .optional()
    .or(z.literal('')),

  // Foto
  photo_url: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),

  // Información de Contacto Personal
  personal_contact: z.string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  personal_number: z.string()
    .regex(/^[2-7]\d{3}-?\d{4}$/, 'El número debe tener 8 dígitos (formato: XXXX-XXXX o XXXXXXXX)')
    .optional()
    .or(z.literal('')),

  // Información de Contacto Comunidad
  community_contact: z.string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  community_number: z.string()
    .regex(/^[2-7]\d{3}-?\d{4}$/, 'El número debe tener 8 dígitos (formato: XXXX-XXXX o XXXXXXXX)')
    .optional()
    .or(z.literal(''))
})

// Esquema para actualizar un beneficiario (todos los campos opcionales)
export const updateBeneficiarySchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),

  age: z.number()
    .int('La edad debe ser un número entero')
    .min(1, 'La edad debe ser al menos 1')
    .max(120, 'La edad no puede exceder 120 años')
    .optional(),

  gender: z.enum(['Masculino', 'Femenino'], {
    message: 'El género debe ser Masculino o Femenino'
  }).optional(),

  dpi: z.string()
    .regex(/^\d{13}$/, 'El DPI debe tener exactamente 13 dígitos numéricos')
    .optional()
    .or(z.literal('')),

  program: z.string()
    .min(1, 'El programa es requerido')
    .optional(),

  admission_date: z.string()
    .refine((date) => {
      const admissionDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return admissionDate <= today
    }, 'La fecha de ingreso no puede ser futura')
    .optional(),

  is_active: z.boolean()
    .optional(),

  department: z.string()
    .min(1, 'El departamento es requerido')
    .optional(),

  municipality: z.string()
    .min(1, 'El municipio es requerido')
    .optional(),

  village: z.string()
    .max(100, 'El nombre de la aldea no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .optional()
    .or(z.literal('')),

  google_maps_url: z.string()
    .url('Debe ser una URL válida')
    .refine(
      (url) => {
        const lowerUrl = url.toLowerCase()
        return lowerUrl.includes('google.com/maps') || 
               lowerUrl.includes('maps.google.com') || 
               lowerUrl.includes('goo.gl') || 
               lowerUrl.includes('maps.app.goo.gl')
      },
      'Debe ser una URL válida de Google Maps (que contenga google.com/maps, maps.google.com, goo.gl o maps.app.goo.gl)'
    )
    .optional()
    .or(z.literal('')),

  photo_url: z.string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),

  // Información de Contacto Personal
  personal_contact: z.string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  personal_number: z.string()
    .regex(/^[2-7]\d{3}-?\d{4}$/, 'El número debe tener 8 dígitos (formato: XXXX-XXXX o XXXXXXXX)')
    .optional()
    .or(z.literal('')),

  // Información de Contacto Comunidad
  community_contact: z.string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  community_number: z.string()
    .regex(/^[2-7]\d{3}-?\d{4}$/, 'El número debe tener 8 dígitos (formato: XXXX-XXXX o XXXXXXXX)')
    .optional()
    .or(z.literal(''))
}).partial()

// Tipos inferidos de los esquemas
export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>
export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>

// Tipo para los errores de validación
export type ValidationErrors = {
  [K in keyof CreateBeneficiaryInput]?: string[]
}

// Función helper para validar y obtener errores formateados
export function validateBeneficiary(data: unknown, isUpdate = false): 
  | { success: true; data: CreateBeneficiaryInput | UpdateBeneficiaryInput; errors?: never }
  | { success: false; errors: ValidationErrors; data?: never } {
  const schema = isUpdate ? updateBeneficiarySchema : createBeneficiarySchema
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, errors }
  }
  
  return { success: true, data: result.data }
}

// Función para obtener mensajes de error por campo
export function getFieldErrors(errors: z.ZodFormattedError<any>, field: string): string | undefined {
  return errors.fieldErrors[field]?.[0]
}

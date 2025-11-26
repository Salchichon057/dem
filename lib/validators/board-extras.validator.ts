import { z } from 'zod'

// Esquema de validación para los campos extras del Tablero Consolidado
export const boardExtrasSchema = z.object({
  submission_id: z.string().uuid('ID de envío inválido'),
  
  traffic_light: z.enum(['Rojo', 'Amarillo', 'Verde']).nullable(),
  
  recommendations: z.string()
    .max(2000, 'Las recomendaciones no pueden exceder 2000 caracteres')
    .nullable(),
  
  follow_up_given: z.boolean(),
  
  follow_up_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .nullable()
    .or(z.literal('')),
  
  concluded_result_red_or_no: z.string()
    .max(1000, 'El texto de conclusión no puede exceder 1000 caracteres')
    .nullable(),
  
  solutions: z.string()
    .max(2000, 'Las soluciones no pueden exceder 2000 caracteres')
    .nullable(),
  
  preliminary_report: z.string()
    .url('La URL del informe preliminar no es válida')
    .nullable()
    .or(z.literal('')),
  
  full_report: z.string()
    .url('La URL del informe completo no es válida')
    .nullable()
    .or(z.literal('')),
})

export type BoardExtrasFormData = z.infer<typeof boardExtrasSchema>

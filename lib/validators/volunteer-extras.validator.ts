import { z } from 'zod'

export const volunteerExtrasSchema = z.object({
  submission_id: z.string().uuid('ID de envío inválido'),
  
  total_hours: z.number()
    .positive('Las horas deben ser positivas')
    .max(24, 'Las horas no pueden exceder 24')
    .min(0.01, 'Las horas deben ser mayores a 0'),
  
  receives_benefit: z.boolean(),
  
  benefit_number: z.string()
    .max(100, 'El número de beneficio no puede exceder 100 caracteres')
    .nullable(),
  
  agricultural_pounds: z.number()
    .min(0, 'Las libras agrícolas no pueden ser negativas')
    .nullable()
    .or(z.literal(0)),
  
  unit_cost_q: z.number()
    .min(0, 'El costo unitario en Q no puede ser negativo')
    .nullable(),
  
  unit_cost_usd: z.number()
    .min(0, 'El costo unitario en USD no puede ser negativo')
    .nullable(),
  
  viveres_bags: z.number()
    .min(0, 'Las bolsas de víveres no pueden ser negativas')
    .nullable(),
  
  average_cost_30lbs: z.number()
    .min(0, 'El costo promedio no puede ser negativo')
    .nullable(),
  
  picking_gtq: z.number()
    .min(0, 'El picking en GTQ no puede ser negativo')
    .nullable(),
  
  picking_5lbs: z.number()
    .min(0, 'El picking en libras no puede ser negativo')
    .nullable(),
  
  total_amount_q: z.number()
    .min(0, 'El monto total en Q no puede ser negativo')
    .nullable(),
  
  group_number: z.number()
    .int('El número de grupo debe ser entero')
    .min(1, 'El número de grupo debe ser mayor a 0')
    .nullable(),
})

export type VolunteerExtrasFormData = z.infer<typeof volunteerExtrasSchema>

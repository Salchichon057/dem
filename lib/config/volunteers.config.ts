export const VOLUNTEERS_CONFIG = {
  FORM_TEMPLATES: {
    VOLUNTARIADO_2025: 'f036d9ff-e51a-46ca-8744-6f8187966f5b',
  },

  VOLUNTEER_TYPES: {
    AGRICOLA: 'Agrícola',
    VIVERES: 'Víveres',
    PICKING: 'Picking',
  },

  SHIFTS: {
    MORNING: 'Mañana',
    AFTERNOON: 'Tarde',
    FULL_DAY: 'Día completo',
  },

  TABLES: {
    EXTRAS: 'volunteer_extras',
    SUBMISSIONS: 'volunteer_submissions',
    ANSWERS: 'volunteer_answers',
  },
} as const

export type VolunteerType = typeof VOLUNTEERS_CONFIG.VOLUNTEER_TYPES[keyof typeof VOLUNTEERS_CONFIG.VOLUNTEER_TYPES]
export type VolunteerShift = typeof VOLUNTEERS_CONFIG.SHIFTS[keyof typeof VOLUNTEERS_CONFIG.SHIFTS]

export function getVolunteerFormId(): string {
  return VOLUNTEERS_CONFIG.FORM_TEMPLATES.VOLUNTARIADO_2025
}

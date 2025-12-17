/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormSectionType } from '@/lib/types'
import { getAnswerValue, calculateHoursDifference } from '@/lib/utils/auto-create-extras'

export interface ExtraFieldMapping {
  questionId: string
  extraField: string
  transform?: (value: any) => any
}

export interface FormExtrasConfig {
  formTemplateId: string
  sectionLocation: FormSectionType
  extrasTable: string
  fieldMappings: ExtraFieldMapping[]
  defaultValues?: Record<string, any | ((answers: any[]) => any)>
}

export const FORM_EXTRAS_MAPPINGS: Record<string, FormExtrasConfig> = {
  'f036d9ff-e51a-46ca-8744-6f8187966f5b': {
    formTemplateId: 'f036d9ff-e51a-46ca-8744-6f8187966f5b',
    sectionLocation: FormSectionType.VOLUNTARIADO,
    extrasTable: 'volunteer_extras',
    fieldMappings: [],
    defaultValues: {
      total_hours: (answers: any[]) => {
        const startTime = getAnswerValue(answers, '4e073bf3-ce31-4455-87eb-d9160c927479')
        const endTime = getAnswerValue(answers, 'd3150b11-4e55-4aa4-baea-134bfe2c64c8')
        return calculateHoursDifference(startTime, endTime)
      },
      receives_benefit: false,
      agricultural_pounds: 0
    }
  },
  
  '5bd783b6-e52c-48de-ab3b-9e7ae8538bd2': {
    formTemplateId: '5bd783b6-e52c-48de-ab3b-9e7ae8538bd2',
    sectionLocation: FormSectionType.AUDITORIAS,
    extrasTable: 'consolidated_board_extras',
    fieldMappings: [],
    defaultValues: {
      follow_up_given: 'No iniciado'
    }
  }
}

export function getFormExtrasConfig(formTemplateId: string): FormExtrasConfig | null {
  return FORM_EXTRAS_MAPPINGS[formTemplateId] || null
}

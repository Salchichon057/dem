/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { getFormExtrasConfig } from '@/lib/config/form-extras-mapping'

interface AnswerData {
  question_id: string
  answer_value: { value: any }
}

export function getAnswerValue(answers: AnswerData[], questionId: string): any {
  const answer = answers.find(a => a.question_id === questionId)
  return answer?.answer_value?.value
}

export function calculateHoursDifference(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 1
  
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes
  
  const diffMinutes = endTotalMinutes - startTotalMinutes
  const hours = diffMinutes / 60
  
  return Math.max(0.1, Math.min(24, hours))
}

export async function autoCreateExtras(
  formTemplateId: string,
  submissionId: string,
  answers: AnswerData[]
): Promise<{ success: boolean; error?: string }> {
  const config = getFormExtrasConfig(formTemplateId)
  
  if (!config) {
    return { success: true }
  }

  const supabase = await createClient()
  const extrasData: Record<string, any> = {
    submission_id: submissionId
  }

  for (const mapping of config.fieldMappings) {
    const answer = answers.find(a => a.question_id === mapping.questionId)
    
    if (answer) {
      let value = answer.answer_value?.value
      
      if (mapping.transform) {
        value = mapping.transform(value)
      }
      
      extrasData[mapping.extraField] = value
    }
  }

  if (config.defaultValues) {
    for (const [field, value] of Object.entries(config.defaultValues)) {
      if (extrasData[field] === undefined) {
        if (typeof value === 'function') {
          extrasData[field] = value(answers)
        } else {
          extrasData[field] = value
        }
      }
    }
  }

  const { error } = await supabase
    .from(config.extrasTable)
    .insert(extrasData)

  if (error) {
    return {
      success: false,
      error: error.message
    }
  }

  return { success: true }
}

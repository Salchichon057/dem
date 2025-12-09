'use client'

import { FormRenderer } from '@/components/form'
import { useRouter } from 'next/navigation'
import type { FormTemplateWithQuestions } from '@/lib/types'

interface PublicFormWrapperProps {
  form: FormTemplateWithQuestions
  slug: string
}

export default function PublicFormWrapper({ form, slug }: PublicFormWrapperProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/form/${slug}/success`)
  }

  return (
    <FormRenderer 
      form={form} 
      isPublic={true}
      onSuccess={handleSuccess}
    />
  )
}

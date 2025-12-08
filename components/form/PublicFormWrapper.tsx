'use client'

import { FormRenderer } from '@/components/form'
import { useRouter } from 'next/navigation'

interface PublicFormWrapperProps {
  form: any
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

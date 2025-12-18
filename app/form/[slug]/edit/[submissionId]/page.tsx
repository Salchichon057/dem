import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'
import FormRenderer from '@/components/form/FormRenderer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { FormTemplateWithQuestions } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string; submissionId: string }>
}

async function getFormWithAnswers(slug: string, submissionId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: formData, error: formError } = await supabase
      .from('form_templates')
      .select(`
        id,
        name,
        description,
        slug,
        is_public,
        is_active,
        section_location,
        version,
        created_by,
        created_at,
        updated_at,
        sections:form_sections (
          id,
          title,
          description,
          order_index,
          form_template_id,
          created_at,
          questions (
            id,
            form_template_id,
            section_id,
            question_type_id,
            title,
            help_text,
            description,
            placeholder,
            is_required,
            order_index,
            config,
            created_at,
            updated_at,
            question_types (
              id,
              code,
              name,
              description
            )
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (formError || !formData) {
      return null
    }

    const allQuestions = formData.sections?.flatMap((section: { questions?: unknown[] }) => section.questions || []) || []
    const form = {
      ...formData,
      questions: allQuestions
    } as unknown as FormTemplateWithQuestions

    const { data: answers } = await supabase
      .from(`${formData.section_location}_answers`)
      .select('question_id, answer_value')
      .eq('submission_id', submissionId)

    return {
      form,
      answers: answers || []
    }
  } catch {
    return null
  }
}

export default async function EditFormPage({ params }: PageProps) {
  const { slug, submissionId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getFormWithAnswers(slug, submissionId)

  if (!data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Formulario no encontrado</h1>
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  const initialAnswers: Record<string, unknown> = {}
  data.answers.forEach((answer: { question_id: string; answer_value: { value: unknown } }) => {
    initialAnswers[answer.question_id] = answer.answer_value?.value
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-purple-600 to-blue-500 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{data.form.name}</h1>
            {data.form.description && (
              <p className="text-purple-100">{data.form.description}</p>
            )}
            <p className="text-sm text-purple-200 mt-2">Editando formulario enviado</p>
          </div>

          <div className="p-8">
            <FormRenderer 
              form={data.form} 
              isPublic={false}
              initialAnswers={initialAnswers}
              submissionId={submissionId}
              isEditMode={true}
              onSuccess={() => {
                window.location.href = '/dashboard'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

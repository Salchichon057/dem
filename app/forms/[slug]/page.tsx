import { getFormBySlug } from '@/app/actions/forms'
import { FormRenderer } from '@/components/form'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { FormTemplateWithQuestions } from '@/lib/types'

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getFormBySlug(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  const form = result.data as FormTemplateWithQuestions

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image 
                  src="/logos/logo-with-text.png" 
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Formularios</h1>
              </div>
            </Link>

            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 text-[#e6235a] hover:text-[#c41e4d] transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="hidden sm:inline">Volver al Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Header */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-6">
          <div className="border-l-4 border-[#e6235a] pl-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {form.name}
            </h2>
            {form.description && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <i className="far fa-question-circle text-[#e6235a]"></i>
              <span>{form.questions?.length || 0} preguntas</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="far fa-clock text-[#e6235a]"></i>
              <span>Versión {form.version}</span>
            </div>
          </div>
        </div>

        {/* Form Renderer */}
        <FormRenderer form={form} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2025. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

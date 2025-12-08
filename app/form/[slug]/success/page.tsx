import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import CloseWindowButton from '@/components/shared/CloseWindowButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getFormName(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/forms/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const formData = await response.json()
    return formData.name
  } catch (error) {
    console.error('Error fetching form name:', error)
    return null
  }
}

export default async function PublicFormSuccessPage({ params }: PageProps) {
  const { slug } = await params
  const formName = await getFormName(slug)

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Gracias por llenar el formulario!
        </h1>

        {formName && (
          <p className="text-lg text-gray-700 mb-4 font-medium">
            {formName}
          </p>
        )}

        <p className="text-gray-600 mb-8">
          Tu respuesta ha sido registrada exitosamente. Puedes cerrar esta ventana si lo deseas.
        </p>

        <div className="space-y-3">
          <CloseWindowButton />

          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

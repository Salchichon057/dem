"use client"

import Image from "next/image"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PlantillasTemplateSection() {
  const handleDownload = () => {
    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement('a')
    link.href = '/template/Plantilla_para_insertar_page-0001.jpg'
    link.download = 'Plantilla_Comunidades.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Plantillas de Comunidades
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Descarga la plantilla para registrar comunidades
          </p>
        </div>
      </div>

      {/* Template Preview and Download */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Preview Image */}
          <div className="relative aspect-3/4 w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <Image
              src="/template/Plantilla_para_insertar_page-0001.jpg"
              alt="Plantilla de Comunidades"
              fill
              className="object-contain bg-gray-50"
              priority
            />
          </div>

          {/* Download Section */}
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Plantilla de Registro
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Esta plantilla contiene todos los campos necesarios para el registro completo de una comunidad, 
                incluyendo datos demográficos, ubicación, contactos y estructura comunitaria.
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Incluye:</h3>
                <ul className="space-y-1 text-xs sm:text-sm text-purple-800">
                  <li>• Información básica de la comunidad</li>
                  <li>• Datos demográficos por grupos de edad</li>
                  <li>• Estructura del comité comunitario</li>
                  <li>• Clasificación y estado</li>
                  <li>• Ubicación y contactos</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-5 sm:py-6 px-6 sm:px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              size="lg"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Descargar Plantilla
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">
              Próximamente
            </h3>
            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
              En futuras versiones, el sistema permitirá cargar archivos con los datos de las comunidades 
              directamente desde esta plantilla, facilitando el registro masivo de información.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

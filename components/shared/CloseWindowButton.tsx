'use client'

import { X } from 'lucide-react'

export default function CloseWindowButton() {
  return (
    <button
      onClick={() => window.close()}
      className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium items-center justify-center gap-2"
    >
      <X className="w-5 h-5" />
      Cerrar ventana
    </button>
  )
}

'use client'

interface ValidationModalProps {
  isOpen: boolean
  onClose: () => void
  missingFields: string[]
}

export default function ValidationModal({ isOpen, onClose, missingFields }: ValidationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Warning icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full">
            <i className="fas fa-exclamation-triangle text-6xl text-yellow-600"></i>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Campos Requeridos
          </h2>
          <p className="text-gray-600 mb-4">
            Por favor completa los siguientes campos antes de continuar:
          </p>
          
          {/* Lista de campos faltantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-48 overflow-y-auto">
            <ul className="text-left space-y-2">
              {missingFields.map((field, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-700">
                  <i className="fas fa-circle text-[6px] text-yellow-600 mt-1.5 mr-2"></i>
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-50 transition-colors shadow-sm font-medium"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

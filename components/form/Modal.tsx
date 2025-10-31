'use client'

import { useEffect } from 'react'

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: ModalType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  showCloseButton?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  showCloseButton = true
}: ModalProps) {
  
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  // Configuración según tipo de modal
  const config = {
    success: {
      icon: 'fa-check-circle',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonBg: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: 'fa-times-circle',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: 'fa-exclamation-triangle',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: 'fa-info-circle',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    },
    confirm: {
      icon: 'fa-question-circle',
      iconBg: 'bg-[#e6235a]/10',
      iconColor: 'text-[#e6235a]',
      buttonBg: 'bg-[#e6235a] hover:bg-[#c41e4d]'
    }
  }[type]

  const isConfirmType = type === 'confirm'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`${config.iconBg} p-4 rounded-full`}>
            <i className={`fas ${config.icon} text-6xl ${config.iconColor}`}></i>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h2>
          <p className="text-gray-600 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className={`flex gap-3 ${isConfirmType ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 ${config.buttonBg} text-white rounded-lg transition-colors shadow-sm font-medium`}
          >
            {confirmText}
          </button>
          
          {isConfirmType && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm font-medium"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

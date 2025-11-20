'use client'

import { useRouter } from 'next/navigation'
import Modal from './Modal'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  onRedirect?: () => void  // Callback opcional antes de redirigir
  redirectPath?: string    // Ruta personalizada de redirección
}

export default function SuccessModal({ isOpen, onClose, message, onRedirect, redirectPath }: SuccessModalProps) {
  const router = useRouter()

  const handleClose = () => {
    onClose()
    if (onRedirect) {
      onRedirect()  // Ejecutar callback (limpiar formulario)
    }
    // Si hay redirectPath, usarlo; si no, cerrar el modal sin redirigir
    if (redirectPath) {
      router.push(redirectPath)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      type="success"
      title="¡Formulario Enviado!"
      message={message}
      confirmText="Volver al Panel"
      onConfirm={handleClose}
      showCloseButton={true}
    />
  )
}


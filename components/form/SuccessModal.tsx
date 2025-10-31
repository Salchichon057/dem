'use client'

import { useRouter } from 'next/navigation'
import Modal from './Modal'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  onRedirect?: () => void  // Callback opcional antes de redirigir
}

export default function SuccessModal({ isOpen, onClose, message, onRedirect }: SuccessModalProps) {
  const router = useRouter()

  const handleClose = () => {
    onClose()
    if (onRedirect) {
      onRedirect()  // Ejecutar callback (limpiar formulario)
    }
    router.push('/admin')
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


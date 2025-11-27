import { useState } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toast: Toast) => {
    // Simular toast con console y alert por ahora
    if (toast.variant === 'destructive') {
      alert(`Error: ${toast.description}`)
    } else {
      // Para éxito, simplemente log por ahora
      setTimeout(() => {
      }, 100)
    }

    setToasts(prev => [...prev, toast])
    
    // Remover después de 3 segundos
    setTimeout(() => {
      setToasts(prev => prev.slice(1))
    }, 3000)
  }

  return {
    toast,
    toasts
  }
}

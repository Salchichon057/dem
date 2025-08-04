"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación en el cliente
    const authenticated = localStorage.getItem("authenticated") === "true"
    setIsAuthenticated(authenticated)
    
    if (!authenticated) {
      router.push("/auth")
    }
  }, [router])

  // Mostrar loading mientras verifica
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirige)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>
}

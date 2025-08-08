'use client'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  // Sin verificaciones, solo mostrar el contenido
  return <>{children}</>
}

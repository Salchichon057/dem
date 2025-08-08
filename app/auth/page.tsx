'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await login(email, password)
      toast.success('¡Bienvenido!')
    } catch (error) {
      console.error('Error en login:', error)
      toast.error('Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await register(name, email, password)
      toast.success('¡Cuenta creada exitosamente!')
    } catch (error) {
      console.error('Error en registro:', error)
      toast.error('Error al crear la cuenta. Intenta con otro email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fondo animado global */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 opacity-70"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
          `,
          animation: 'backgroundShift 20s ease-in-out infinite'
        }}></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Patrones decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-1/3 -right-10 w-32 h-32 bg-pink-300/30 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300/25 rounded-full animate-float"></div>
        <div className="absolute top-20 right-1/3 w-16 h-16 bg-yellow-300/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-20 w-20 h-20 bg-purple-300/35 rounded-full animate-float"></div>
      </div>

      {/* Líneas decorativas animadas */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      </div>

      {/* Contenedor principal centrado */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Desarrollo en Movimiento
                </span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-white/60 to-white/20 mx-auto rounded-full"></div>
            </div>
            <p className="text-white/90 text-lg font-medium drop-shadow-md">
              Plataforma integral de gestión
            </p>
            <p className="text-white/75 text-sm mt-1">
              Formularios • Organizaciones • Estadísticas
            </p>
          </div>

          {/* Tarjeta de autenticación con efecto glassmorphism */}
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/20 backdrop-blur-sm">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80 font-semibold"
                  >
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/80 font-semibold"
                  >
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                {/* Formulario de Login */}
                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white font-medium">
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white/30 hover:bg-white/40 text-white font-semibold py-3 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Formulario de Registro */}
                <TabsContent value="register" className="space-y-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white font-medium">
                        Nombre completo
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white font-medium">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white font-medium">
                        Contraseña
                      </Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        required
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white/30 hover:bg-white/40 text-white font-semibold py-3 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

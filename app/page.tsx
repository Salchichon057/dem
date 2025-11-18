'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Users, FileText, BarChart3, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      toast.success('¡Bienvenido!')
      router.push('/dashboard')
      router.refresh()
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })
      
      if (error) throw error
      
      toast.success('¡Cuenta creada exitosamente!')
      // Redirección directa al dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error en registro:', error)
      toast.error('Error al crear la cuenta. Intenta con otro email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sección Izquierda - Logo y Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo animado con patrones */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 opacity-70"></div>
          
          {/* Patrones geométricos CSS */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px),
              repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 40px)
            `,
            animation: 'backgroundShift 20s ease-in-out infinite'
          }}></div>

          {/* Patrones decorativos adicionales */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `
                polygon(50% 0%, 0% 100%, 100% 100%),
                circle(10px at 20px 30px),
                circle(8px at 40px 70px),
                circle(12px at 80px 20px)
              `,
              backgroundRepeat: 'repeat',
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          {/* Elementos flotantes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-32 right-16 w-40 h-40 bg-purple-300/20 rounded-full blur-xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-16 w-24 h-24 bg-cyan-300/15 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-pink-300/25 rounded-full animate-float"></div>
          </div>
        </div>

        {/* Contenido de la sección izquierda */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white min-h-full m-auto">
          {/* Logo principal */}
          <div className="text-center mb-12">
            <div className="w-40 h-40 mx-auto mb-8 relative">
              {/* Logo real de la organización */}
              <div className="w-full h-full relative">
                <Image
                  src="/logos/logo-with-text.png"
                  alt="Desarrollo en Movimiento"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold mb-4 leading-tight text-center">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent block">
                DESARROLLO
              </span>
              <span className="bg-gradient-to-r from-cyan-100 via-white to-blue-100 bg-clip-text text-transparent block">
                EN MOVIMIENTO
              </span>
            </h1>
            
            <div className="w-32 h-1 bg-gradient-to-r from-white/60 via-white/80 to-white/60 mx-auto rounded-full"></div>
          </div>

          {/* Descripción y características centradas */}
          <div className="text-center space-y-8 max-w-lg mx-auto">
            <p className="text-xl font-medium text-white/90 leading-relaxed text-center">
              Plataforma integral de gestión para organizaciones sociales
            </p>
            
            <div className="space-y-5">
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <Users className="w-6 h-6 text-cyan-300 flex-shrink-0" />
                <span className="text-center">Gestión de organizaciones y miembros</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <FileText className="w-6 h-6 text-purple-300 flex-shrink-0" />
                <span className="text-center">Formularios dinámicos y personalizables</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <BarChart3 className="w-6 h-6 text-pink-300 flex-shrink-0" />
                <span className="text-center">Estadísticas y reportes en tiempo real</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                <span className="text-center">Herramientas de colaboración avanzadas</span>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-center">
              <p className="text-base text-white/85 italic leading-relaxed">
                &ldquo;Transformando ideas en acciones concretas para el desarrollo social&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Derecha - Formularios de Autenticación */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Fondo sutil para móviles cuando no se muestra la sección izquierda */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-50 opacity-50"></div>
        
        <div className="relative z-10 w-full max-w-md">
          {/* Header para móviles */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              🤝
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Desarrollo en Movimiento</h1>
            <p className="text-gray-600">Accede a tu cuenta</p>
          </div>

          {/* Tarjeta de autenticación */}
          <Card className="backdrop-blur-sm bg-white/80 border-gray-200 shadow-xl">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-semibold"
                  >
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600 font-semibold"
                  >
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                {/* Formulario de Login */}
                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
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
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nombre completo
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-700 font-medium">
                        Contraseña
                      </Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        required
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
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

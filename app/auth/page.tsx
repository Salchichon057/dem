"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  // Verificar si ya está autenticado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authenticated = localStorage.getItem("authenticated") === "true"
      if (authenticated) {
        window.location.href = "/"
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simular éxito (completamente simulado, sin validación)
    localStorage.setItem("authenticated", "true")
    localStorage.setItem("user", JSON.stringify({
      name: formData.name || "Usuario Demo",
      email: formData.email || "demo@example.com"
    }))
    
    // Redirigir al dashboard
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fondo animado global */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 opacity-70"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 20px 20px',
          animation: 'backgroundShift 10s ease-in-out infinite'
        }}></div>
      </div>

      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 text-white">
        <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <Image
                src="/logos/logo-with-text.png"
                alt="Logo ONG"
                width={200}
                height={80}
                className="mx-auto mb-6 drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
              Bienvenido al Dashboard
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Gestiona tu organización de manera eficiente y transparente
            </p>
            <div className="mt-8 space-y-4 text-white/90">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                <span className="drop-shadow-sm">Gestión de formularios dinámicos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                <span className="drop-shadow-sm">Estadísticas en tiempo real</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                <span className="drop-shadow-sm">Plantillas personalizables</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm"></div>
        <div className="w-full max-w-md relative z-10">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="backdrop-blur-sm bg-white/20 rounded-2xl p-4 inline-block border border-white/30">
              <Image
                src="/logos/logo-with-text.png"
                alt="Logo ONG"
                width={150}
                height={60}
                className="mx-auto drop-shadow-lg"
              />
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 backdrop-blur-sm bg-white/70 border-0 shadow-lg">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            {/* Tab de Login */}
            <TabsContent value="login">
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Iniciar Sesión
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Ingresa tus credenciales para acceder al dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Correo electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="backdrop-blur-sm bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="backdrop-blur-sm bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-purple-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <span>¿Olvidaste tu contraseña? </span>
                    <Button variant="link" className="p-0 h-auto font-normal text-purple-600 hover:text-purple-800">
                      Recuperar contraseña
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Registro */}
            <TabsContent value="register">
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Crear Cuenta
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Crea una nueva cuenta para acceder al dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Nombre completo</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="backdrop-blur-sm bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-700 font-medium">Correo electrónico</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="backdrop-blur-sm bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-700 font-medium">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="backdrop-blur-sm bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-blue-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="backdrop-blur-sm bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        "Crear Cuenta"
                      )}
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Al registrarte, aceptas nuestros{" "}
                    <Button variant="link" className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800">
                      términos y condiciones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

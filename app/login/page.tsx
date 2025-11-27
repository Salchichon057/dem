"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Eye,
  EyeOff,
  Users,
  BarChart3,
  FileText,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("¡Bienvenido!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback`,
          data: { name },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("¡Cuenta creada exitosamente!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Error al crear la cuenta. Intenta con otro email.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Users, text: "Gestión de organizaciones" },
    { icon: FileText, text: "Formularios personalizables" },
    { icon: BarChart3, text: "Reportes en tiempo real" },
    { icon: Shield, text: "Seguridad garantizada" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Fondo animado con cards modernas */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo animado con patrones */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-blue-600 to-cyan-500">
          <div className="absolute inset-0 bg-linear-to-tr from-pink-500 via-purple-500 to-blue-500 opacity-70"></div>

          {/* Patrones geométricos CSS */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px),
              repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 40px)
            `,
              animation: "backgroundShift 20s ease-in-out infinite",
            }}
          ></div>

          {/* Patrones decorativos adicionales */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `
                polygon(50% 0%, 0% 100%, 100% 100%),
                circle(10px at 20px 30px),
                circle(8px at 40px 70px),
                circle(12px at 80px 20px)
              `,
                backgroundRepeat: "repeat",
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>

          {/* Elementos flotantes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-32 right-16 w-40 h-40 bg-purple-300/20 rounded-full blur-xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-16 w-24 h-24 bg-cyan-300/15 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-pink-300/25 rounded-full animate-float"></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl mx-auto text-white">
          {/* Logo y Título */}
          <div className="mb-12">
            <div className="w-24 h-24 mb-6 relative transform hover:scale-105 transition-transform">
              <Image
                src="/logos/logo-with-text.png"
                alt="Desarrollo en Movimiento"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              DESARROLLO
              <br />
              EN MOVIMIENTO
            </h1>
            <div className="w-20 h-1 bg-white rounded-full mb-6"></div>
            <p className="text-xl text-white">
              Plataforma integral de gestión para organizaciones sociales
            </p>
          </div>

          {/* Grid de Features con estilo card */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all hover:shadow-lg group border border-white/20"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                  opacity: 0,
                }}
              >
                <feature.icon className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-white font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Section */}
        <div className="absolute bottom-8 left-0 right-0 text-center px-16">
          <p className="text-blue-100 italic text-sm">
            &ldquo;Transformando ideas en acciones concretas para el desarrollo
            social&rdquo;
          </p>
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Fondo sutil para móviles */}
        <div className="lg:hidden absolute inset-0 bg-linear-to-br from-purple-100 via-blue-50 to-cyan-50 opacity-50"></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              🤝
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Desarrollo en Movimiento
            </h1>
            <p className="text-gray-600">Accede a tu cuenta</p>
          </div>

          {/* Card */}
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

                {/* Login */}
                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium"
                      >
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
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
                </TabsContent>

                {/* Register */}
                <TabsContent value="register" className="space-y-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        Nombre completo
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Tu nombre completo"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="register-email"
                        className="text-gray-700 font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="register-password"
                        className="text-gray-700 font-medium"
                      >
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showRegisterPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        "Crear Cuenta"
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
  );
}


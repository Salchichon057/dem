"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { FormulariosSection } from "@/components/forms/formularios-section"
import { PerfilSection } from "@/components/settings/perfil-section"
import { ConfiguracionSection } from "@/components/settings/configuracion-section"
import { PlantillasComunidadesSection } from "@/components/communities/plantillas-comunidades-section"
import { PimcoFormulariosSection } from "@/components/communities/pimco-formularios-section"
import { FormulariosAuditoriaSection } from "@/components/audits/formularios-auditoria-section"
import AbrazandoLeyendasSection from "@/components/forms/abrazando-leyendas-section"
import { FormularioVoluntariadoSection } from "@/components/forms/formulario-voluntariado-section"
import { OrganizacionesEstadisticaSection } from "@/components/statistics/organizaciones-estadistica-section"
import { ComunidadesEstadisticaSection } from "@/components/statistics/comunidades-estadistica-section"
import { AuditoriasEstadisticaSection } from "@/components/statistics/auditorias-estadistica-section"
import { VoluntariadoEstadisticaSection } from "@/components/statistics/voluntariado-estadistica-section"
import { PimcoEstadisticaSection } from "@/components/statistics/pimco-estadistica-section"
import Image from "next/image"
import { Construction, FileText } from "lucide-react"

interface DashboardContentProps {
  activeSection: string
}

// Componente para secciones en desarrollo
const UnderConstruction = ({ title, variant = 'coming-soon' }: { title: string; variant?: 'coming-soon' | 'no-data' }) => {
  if (variant === 'no-data') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">No hay {title.toLowerCase()}</h2>
        <p className="text-gray-600 text-lg mb-2">Comienza creando el primer registro</p>
        <p className="text-gray-500 text-sm">Los datos aparecerán aquí una vez que agregues información</p>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-12 h-12 text-purple-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-gray-600 text-lg mb-2">Estamos trabajando en esta sección</p>
      <p className="text-gray-500 text-sm">Pronto estará disponible</p>
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const renderSection = () => {
    switch (activeSection) {
      // PIMCO - Perfil Comunitario
      case "pimco-comunidades":
        return <UnderConstruction title="PIMCO - Comunidades" />
      case "pimco-estadistica":
        return <PimcoEstadisticaSection />
      case "pimco-formularios":
        return <PimcoFormulariosSection />
      case "pimco-diagnostico-comunitario":
        return <UnderConstruction title="PIMCO - Diagnóstico Comunitario" />
      
      // Organizaciones
      case "organizaciones-estadistica":
        return <OrganizacionesEstadisticaSection />
      case "organizaciones-formularios":
        return <FormulariosSection />
      
      // Comunidades
      case "comunidades-estadistica":
        return <ComunidadesEstadisticaSection />
      case "comunidades-formularios":
        return <PlantillasComunidadesSection />
      case "comunidades-plantillas":
        return <UnderConstruction title="Plantillas de Comunidades" />
      
      // Auditorías
      case "auditorias-estadistica":
        return <AuditoriasEstadisticaSection />
      case "auditorias-formularios":
        return <FormulariosAuditoriaSection />
      case "auditorias-tablero-consolidado":
        return <UnderConstruction title="Tablero Consolidado" />
      case "auditorias-semaforo":
        return <UnderConstruction title="Semáforo" />
      
      // Abrazando Leyendas
      case "abrazando-leyendas":
        return <AbrazandoLeyendasSection />
      
      // Voluntariado
      case "voluntariado-estadistica":
        return <VoluntariadoEstadisticaSection />
      case "voluntariado-formularios":
        return <FormularioVoluntariadoSection />
      
      // Configuración y Perfil (no están en sidebar pero se acceden desde footer dropdown)
      case "perfil":
        return <PerfilSection />
      case "configuracion":
        return <ConfiguracionSection />
      
      default:
        return <UnderConstruction title="PIMCO - Comunidades" />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      // PIMCO - Perfil Comunitario
      case "pimco-comunidades":
        return "Perfil Comunitario - Comunidades"
      case "pimco-estadistica":
        return "Perfil Comunitario - Estadística"
      case "pimco-formularios":
        return "Perfil Comunitario - Formularios"
      case "pimco-diagnostico-comunitario":
        return "Perfil Comunitario - Diagnóstico Comunitario"
      
      // Organizaciones
      case "organizaciones-estadistica":
        return "Organizaciones - Estadística"
      case "organizaciones-formularios":
        return "Organizaciones - Formularios"
      
      // Comunidades
      case "comunidades-estadistica":
        return "Comunidades - Estadística"
      case "comunidades-formularios":
        return "Comunidades - Formularios"
      case "comunidades-plantillas":
        return "Comunidades - Plantillas"
      
      // Auditorías
      case "auditorias-estadistica":
        return "Auditorías - Estadística"
      case "auditorias-formularios":
        return "Auditorías - Formularios"
      case "auditorias-tablero-consolidado":
        return "Auditorías - Tablero Consolidado"
      case "auditorias-semaforo":
        return "Auditorías - Semáforo"
      
      // Abrazando Leyendas
      case "abrazando-leyendas":
        return "Abrazando Leyendas"
      
      // Voluntariado
      case "voluntariado-estadistica":
        return "Voluntariado - Estadística"
      case "voluntariado-formularios":
        return "Voluntariado - Formularios"
      
      // Configuración y Perfil
      case "perfil":
        return "Perfil de Usuario"
      case "configuracion":
        return "Configuración"
      
      default:
        return "Perfil Comunitario - Comunidades"
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-60"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
        `,
        backgroundSize: '100% 100%'
      }}></div>
      
      <header className="relative z-10 flex h-16 items-center gap-4 border-b border-purple-200/50 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 px-6 shadow-lg">
        <SidebarTrigger className="text-white hover:bg-white/20 rounded-lg transition-colors duration-200" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white drop-shadow-sm">
            {getSectionTitle()}
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-black/5 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
            <span className="text-sm font-medium text-white drop-shadow-md">
              Bienvenido, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
            </span>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 flex-1 p-6" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
      }}>
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </div>
      
      <footer className="relative z-10 border-t border-purple-200/50 bg-gradient-to-r from-gray-800 via-gray-900 to-black px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r rounded-full flex items-center justify-center">
                <Image
                  src="/logos/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-gray-300 font-medium">© 2025 Desarrollo en Movimiento. Todos los derechos reservados.</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Versión 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

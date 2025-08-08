"use client"

import { useAuth } from "@/contexts/auth-context"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { OrganizacionesSection } from "@/components/organizaciones-section"
import { EstadisticasSection } from "@/components/estadisticas-section"
import { PlantillasSection } from "@/components/plantillas-section"
import { FormulariosSection } from "@/components/formularios-section"
import { PerfilSection } from "@/components/perfil-section"
import { ConfiguracionSection } from "@/components/configuracion-section"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const { user } = useAuth()

  const renderSection = () => {
    switch (activeSection) {
      case "organizaciones":
        return <OrganizacionesSection />
      case "estadisticas":
        return <EstadisticasSection />
      case "plantillas":
        return <PlantillasSection />
      case "formularios":
        return <FormulariosSection />
      case "perfil":
        return <PerfilSection />
      case "configuracion":
        return <ConfiguracionSection />
      default:
        return <OrganizacionesSection />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case "organizaciones":
        return "📊 Lista de Organizaciones"
      case "estadisticas":
        return "📈 Estadísticas"
      case "plantillas":
        return "📋 Plantillas"
      case "formularios":
        return "📝 Formularios"
      case "perfil":
        return "👤 Perfil de Usuario"
      case "configuracion":
        return "⚙️ Configuración"
      default:
        return "📊 Lista de Organizaciones"
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
        <div className="hidden md:flex items-center space-x-4 text-white/90">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">
              Bienvenido, {user?.name || user?.email || 'Usuario'}
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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">DM</span>
              </div>
              <span className="text-gray-300 font-medium">© 2025 Desarrollo en Movimiento. Todos los derechos reservados.</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Versión 1.0.0</span>
            </div>
            <span>•</span>
            <span>Soporte: info@desarrolloenmovimiento.org</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

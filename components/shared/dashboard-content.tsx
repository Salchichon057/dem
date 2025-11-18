"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { FormSectionType } from "@/lib/types"
import { EstadisticasSection } from "@/components/statistics/estadisticas-section"
import { PlantillasSection } from "@/components/forms/plantillas-section"
import { FormulariosSection } from "@/components/forms/formularios-section"
import { PerfilSection } from "@/components/settings/perfil-section"
import { ConfiguracionSection } from "@/components/settings/configuracion-section"
import { PerfilComunitarioSection } from "@/components/communities/perfil-comunitario-section"
import { EstadisticasComunidadesSection } from "@/components/communities/estadisticas-comunidades-section"
import { PlantillasComunidadesSection } from "@/components/communities/plantillas-comunidades-section"
import { FormulariosAuditoriaSection } from "@/components/audits/formularios-auditoria-section"
import AbrazandoLeyendasSection from "@/components/forms/abrazando-leyendas-section"
import VoluntariadoSection from "@/components/forms/voluntariado-section"
import FormsList from "@/components/form/FormsList"
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
  // Obtener usuario de Supabase Auth en el futuro
  const user = { name: 'Usuario', email: 'usuario@example.com' }

  const renderSection = () => {
    switch (activeSection) {
      // Secciones principales - Organizaciones
      case "organizaciones-estadistica":
        return <UnderConstruction title="datos de organizaciones" variant="no-data" />
      case "organizaciones-formularios":
        return <FormsList sectionLocation={FormSectionType.ORGANIZACIONES} locationName="Organizaciones" />
      
      // Secciones de Comunidades
      case "comunidades-estadistica":
        return <UnderConstruction title="datos de comunidades" variant="no-data" />
      case "comunidades-formularios":
        return <FormsList sectionLocation={FormSectionType.COMUNIDADES} locationName="Comunidades" />
      case "comunidades-plantillas":
        return <UnderConstruction title="Plantillas de Comunidades" />
      
      // Secciones de Auditorías
      case "auditorias-estadistica":
        return <UnderConstruction title="datos de auditorías" variant="no-data" />
      case "auditorias-formularios":
        return <FormsList sectionLocation={FormSectionType.AUDITORIAS} locationName="Auditorías" />
      case "auditorias-tablero-consolidado":
        return <UnderConstruction title="Tablero Consolidado" />
      case "auditorias-semaforo":
        return <UnderConstruction title="Semáforo" />
      
      // Secciones de Abrazando Leyendas
      case "abrazando-leyendas":
        return <AbrazandoLeyendasSection />
      
      // Secciones de Voluntariado
      case "voluntariado-estadistica":
        return <VoluntariadoSection />
      case "voluntariado-formularios":
        return <FormsList sectionLocation={FormSectionType.VOLUNTARIADO} locationName="Voluntariado" />
      
      // Secciones de PIMCO
      case "pimco-comunidades":
        return <UnderConstruction title="PIMCO - Comunidades" />
      case "pimco-estadistica":
        return <UnderConstruction title="datos del perfil comunitario" variant="no-data" />
      case "pimco-formularios":
        return <FormsList sectionLocation={FormSectionType.PERFIL_COMUNITARIO} locationName="Perfil Comunitario" />
      case "pimco-entrevistas":
        return <UnderConstruction title="PIMCO - Entrevistas" />
      case "pimco-diagnostico-comunitario":
        return <UnderConstruction title="PIMCO - Diagnóstico Comunitario" />
      
      // Legacy/Old routes - mantener por compatibilidad
      case "organizaciones":
        return <UnderConstruction title="Organizaciones" />
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
      case "lista-comunidades":
        return <UnderConstruction title="Lista de Comunidades" />
      case "perfil-comunitario":
        return <PerfilComunitarioSection />
      case "estadisticas-comunidades":
        return <EstadisticasComunidadesSection />
      case "plantillas-comunidades":
        return <PlantillasComunidadesSection />
      case "formularios-auditoria":
        return <FormulariosAuditoriaSection />
      case "bases-datos-auditoria":
        return <UnderConstruction title="Bases de Datos" />
      case "tablero-consolidado":
        return <UnderConstruction title="Tablero Consolidado" />
      case "estadistica-auditoria":
        return <UnderConstruction title="Estadísticas de Auditoría" />
      case "semaforo":
        return <UnderConstruction title="Semáforo" />
      case "abrazando-leyendas":
      case "lista-beneficiarios":
      case "estadistica-leyendas":
        return <AbrazandoLeyendasSection />
      case "pimco-graficas-estadisticas-dashboard":
        return <UnderConstruction title="PIMCO - Gráficas y Estadísticas" />
      case "pimco-bd-estadisticas":
        return <UnderConstruction title="PIMCO - Base de Datos Estadísticas" />
      
      default:
        return <FormulariosSection />
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      // Organizaciones
      case "organizaciones":
        return "Lista de Organizaciones"
      case "organizaciones-estadistica":
        return "Organizaciones - Estadística"
      case "organizaciones-formularios":
        return "Organizaciones - Formularios"
      
      // Comunidades
      case "lista-comunidades":
        return "Lista de Comunidades"
      case "perfil-comunitario":
        return "Perfil Comunitario"
      case "estadisticas-comunidades":
        return "Estadísticas de Comunidades"
      case "plantillas-comunidades":
        return "Plantillas de Comunidades"
      case "comunidades-estadistica":
        return "Comunidades - Estadística"
      case "comunidades-formularios":
        return "Comunidades - Formularios"
      case "comunidades-plantillas":
        return "Comunidades - Plantillas"
      
      // Auditorías
      case "formularios-auditoria":
        return "Formularios de Auditoría"
      case "bases-datos-auditoria":
        return "Bases de Datos"
      case "tablero-consolidado":
        return "Tablero Consolidado"
      case "estadistica-auditoria":
        return "Estadísticas de Auditoría"
      case "semaforo":
        return "Semáforo"
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
      case "lista-beneficiarios":
        return "Lista de Beneficiarios"
      case "estadistica-leyendas":
        return "Estadísticas de Leyendas"
      
      // Voluntariado
      case "voluntariado-estadistica":
        return "Estadísticas de Voluntariado"
      case "voluntariado-formularios":
        return "Formularios de Voluntariado"
      
      // PIMCO
      case "pimco-comunidades":
        return "PIMCO - Comunidades"
      case "pimco-graficas-estadisticas-dashboard":
        return "PIMCO - Gráficas y Estadísticas"
      case "pimco-bd-estadisticas":
        return "PIMCO - Base de Datos Estadísticas"
      case "pimco-formularios":
        return "PIMCO - Formularios"
      case "pimco-entrevistas":
        return "PIMCO - Entrevistas"
      case "pimco-diagnostico-comunitario":
        return "PIMCO - Diagnóstico Comunitario"
      case "pimco-estadistica":
        return "PIMCO - Estadística"
      
      // Generales
      case "estadisticas":
        return "Estadísticas"
      case "plantillas":
        return "Plantillas"
      case "formularios":
        return "Formularios"
      case "perfil":
        return "Perfil de Usuario"
      case "configuracion":
        return "Configuración"
      
      default:
        return "Lista de Organizaciones"
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

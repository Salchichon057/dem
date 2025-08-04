"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { OrganizacionesSection } from "@/components/organizaciones-section"
import { EstadisticasSection } from "@/components/estadisticas-section"
import { PlantillasSection } from "@/components/plantillas-section"
import { FormulariosSection } from "@/components/formularios-section"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
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
      default:
        return <OrganizacionesSection />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-booster-gray-800 px-6">
        <SidebarTrigger className="text-white hover:bg-booster-gray-700" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">
            {activeSection === "organizaciones" && "Lista de Organizaciones"}
            {activeSection === "estadisticas" && "Estadísticas"}
            {activeSection === "plantillas" && "Plantillas"}
            {activeSection === "formularios" && "Formularios"}
          </h1>
        </div>
      </header>
      <div className="flex-1 p-6 bg-booster-gray-50">{renderSection()}</div>
      <footer className="border-t border-gray-200 bg-booster-gray-800 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>© 2024 AdminPanel Dashboard. Todos los derechos reservados.</span>
          <div className="flex items-center space-x-4">
            <span>Versión 1.0.0</span>
            <span>•</span>
            <span>Soporte: admin@empresa.com</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("organizaciones")
  const { loading } = useAuth()

  // Mostrar loading mientras se verifican los datos del usuario
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main className="flex-1 overflow-auto">
            <DashboardContent activeSection={activeSection} />
          </main>
        </div>
      </SidebarProvider>
  )
}

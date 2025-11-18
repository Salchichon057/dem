"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { DashboardContent } from "@/components/shared/dashboard-content"
import { AuthWrapper } from "@/components/shared/auth-wrapper"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("organizaciones")

  return (
    <AuthWrapper>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main className="flex-1 overflow-auto">
            <DashboardContent activeSection={activeSection} />
          </main>
        </div>
      </SidebarProvider>
    </AuthWrapper>
  )
}

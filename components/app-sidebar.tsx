"use client"

import { Building2, BarChart3, FileIcon as FileTemplate, FileText, Settings, User, ChevronDown } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  {
    id: "organizaciones",
    title: "Lista de Organizaciones",
    icon: Building2,
  },
  {
    id: "estadisticas",
    title: "Estadísticas",
    icon: BarChart3,
  },
  {
    id: "plantillas",
    title: "Plantillas",
    icon: FileTemplate,
  },
  {
    id: "formularios",
    title: "Formularios",
    icon: FileText,
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-booster-blue text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">AdminPanel</span>
            <span className="text-xs text-gray-500">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium">Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 data-[active=true]:bg-booster-blue data-[active=true]:text-white"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full text-gray-700 hover:bg-gray-100">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback className="bg-gray-200 text-gray-700">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-gray-900">Admin User</span>
                    <span className="text-xs text-gray-500">admin@empresa.com</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

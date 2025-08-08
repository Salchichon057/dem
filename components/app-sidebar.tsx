'use client'

import Image from 'next/image'
import { Building2, BarChart3, FileIcon as FileTemplate, FileText, Settings, User, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

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
} from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const menuItems = [
  {
    id: 'organizaciones',
    title: 'Lista de Organizaciones',
    icon: Building2,
  },
  {
    id: 'estadisticas',
    title: 'Estadísticas',
    icon: BarChart3,
  },
  {
    id: 'plantillas',
    title: 'Plantillas',
    icon: FileTemplate,
  },
  {
    id: 'formularios',
    title: 'Formularios',
    icon: FileText,
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const getUserInitials = (name: string | undefined | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Sidebar className="border-r border-purple-200/50 bg-gradient-to-b from-white via-purple-50/30 to-blue-50/30 shadow-xl">
      <SidebarHeader className="border-b border-purple-200/50 px-6 py-4 bg-gradient-to-r from-white to-purple-50/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/logos/logo-with-text.png"
              alt="Logo ONG"
              width={120}
              height={40}
              className="h-10 w-auto drop-shadow-lg"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Desarrollo en Movimiento
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 bg-gradient-to-b from-white/95 to-purple-50/95">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-semibold mb-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span>Navegación Principal</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`
                      w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-gray-900 rounded-lg transition-all duration-300 mb-1
                      ${activeSection === item.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600' 
                        : ''
                      }
                    `}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <item.icon className={`h-4 w-4 ${activeSection === item.id ? 'text-white' : 'text-gray-600'}`} />
                    <span className="font-medium">{item.title}</span>
                    {activeSection === item.id && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-purple-200/50 p-4 bg-gradient-to-r from-white to-purple-50/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-300">
                  <Avatar className="h-6 w-6 ring-2 ring-purple-200">
                    <AvatarImage src={user?.avatar || '/placeholder.svg?height=24&width=24'} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] backdrop-blur-sm bg-white/95 border-purple-200">
                <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100">
                  <User className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100">
                  <Settings className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-gray-700">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

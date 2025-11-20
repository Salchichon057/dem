'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Building2, BarChart3, FileText, Settings, User, ChevronDown, LogOut, MapPin, Shield, Activity, Heart, UserCheck, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

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
  // Perfil Comunitario - Subniveles en sidebar
  {
    id: 'pimco',
    title: 'Perfil Comunitario',
    icon: Building2,
    children: [
      {
        id: 'pimco-comunidades',
        title: 'Comunidades',
        icon: MapPin,
      },
      {
        id: 'pimco-estadistica',
        title: 'Estadística',
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: 'pimco-formularios',
        title: 'Formularios',
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
      {
        id: 'pimco-diagnostico-comunitario',
        title: 'Diagnóstico Comunitario',
        icon: Activity,
      },
    ]
  },
  // Organizaciones - Subniveles en sidebar (Estadística + Formularios)
  {
    id: 'organizaciones',
    title: 'Organizaciones',
    icon: Building2,
    children: [
      {
        id: 'organizaciones-estadistica',
        title: 'Estadística',
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: 'organizaciones-formularios',
        title: 'Formularios',
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
    ]
  },
  // Comunidades - Subniveles en sidebar (Estadística + Formularios + Plantillas)
  {
    id: 'comunidades',
    title: 'Comunidades',
    icon: MapPin,
    children: [
      {
        id: 'comunidades-estadistica',
        title: 'Estadística',
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: 'comunidades-formularios',
        title: 'Formularios',
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
      {
        id: 'comunidades-plantillas',
        title: 'Plantillas',
        icon: FileText,
      },
    ]
  },
  // Auditorías - Subniveles en sidebar
  {
    id: 'auditorias',
    title: 'Auditorías',
    icon: Shield,
    children: [
      {
        id: 'auditorias-estadistica',
        title: 'Estadística',
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: 'auditorias-formularios',
        title: 'Formularios',
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
      {
        id: 'auditorias-tablero-consolidado',
        title: 'Tablero Consolidado',
        icon: Activity,
      },
      {
        id: 'auditorias-semaforo',
        title: 'Semáforo',
        icon: TrendingUp,
      },
    ]
  },
  // Abrazando Leyendas - Clic directo (sin subniveles)
  {
    id: 'abrazando-leyendas',
    title: 'Abrazando Leyendas',
    icon: Heart,
  },
  // Voluntariado - Subniveles en sidebar (Estadística + Formularios) - ESTRUCTURA ORIGINAL CORRECTA
  {
    id: 'voluntariado',
    title: 'Voluntariado',
    icon: UserCheck,
    children: [
      {
        id: 'voluntariado-estadistica',
        title: 'Estadística',
        icon: BarChart3,
      },
      {
        id: 'voluntariado-formularios',
        title: 'Formularios',
        icon: FileText,
      },
    ]
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleProfile = () => {
    setActiveSection('perfil')
  }

  const handleSettings = () => {
    setActiveSection('configuracion')
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
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Bienvenido, {user?.email?.split('@')[0] || 'Usuario'}
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
                  {item.children ? (
                    <div>
                      <SidebarMenuButton
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full justify-start text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:text-gray-900 rounded-lg transition-all duration-300 mb-1"
                      >
                        <item.icon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{item.title}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${
                          expandedItems.includes(item.id) ? 'rotate-180' : ''
                        }`} />
                      </SidebarMenuButton>
                      {expandedItems.includes(item.id) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((subItem) => (
                            <SidebarMenuButton
                              key={subItem.id}
                              isActive={activeSection === subItem.id}
                              onClick={() => setActiveSection(subItem.id)}
                              className={`
                                w-full justify-start text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-gray-800 rounded-lg transition-all duration-300
                                ${activeSection === subItem.id 
                                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md hover:from-purple-500 hover:to-pink-500' 
                                  : ''
                                }
                              `}
                            >
                              <subItem.icon className={`h-3 w-3 ${activeSection === subItem.id ? 'text-white' : 'text-gray-500'}`} />
                              <span className="text-sm font-medium">{subItem.title}</span>
                              {activeSection === subItem.id && (
                                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                              )}
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
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
                  )}
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
                    <AvatarImage src={user?.user_metadata?.avatar_url || '/placeholder.svg?height=24&width=24'} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                      {getUserInitials(user?.user_metadata?.name || user?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-gray-900">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] backdrop-blur-sm bg-white/95 border-purple-200">
                <DropdownMenuItem 
                  onClick={handleProfile}
                  className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSettings}
                  className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 cursor-pointer"
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

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Building2,
  BarChart3,
  FileText,
  Settings,
  User,
  ChevronDown,
  LogOut,
  MapPin,
  Shield,
  Activity,
  Heart,
  UserCheck,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import type { SectionKey } from "@/lib/types/permissions";

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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  // Perfil Comunitario - Subniveles en sidebar
  {
    id: "pimco",
    title: "Perfil Comunitario",
    icon: Building2,
    children: [
      {
        id: "pimco-comunidades",
        title: "Comunidades",
        icon: MapPin,
      },
      {
        id: "pimco-estadistica",
        title: "Estadística",
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: "pimco-formularios",
        title: "Formularios",
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
      {
        id: "pimco-diagnostico-comunitario",
        title: "Diagnóstico Comunitario",
        icon: Activity,
      },
    ],
  },
  // Organizaciones - Subniveles en sidebar (Estadística + Formularios)
  {
    id: "organizaciones",
    title: "Organizaciones",
    icon: Building2,
    children: [
      {
        id: "organizaciones-estadistica",
        title: "Estadística",
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: "organizaciones-formularios",
        title: "Formularios",
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
    ],
  },
  // Comunidades - Subniveles en sidebar (Estadísticas + Plantillas)
  {
    id: "comunidades",
    title: "Comunidades",
    icon: MapPin,
    children: [
      {
        id: "comunidades-lista",
        title: "Estadísticas",
        icon: BarChart3,
      },
      // {
      //   id: "comunidades-estadistica",
      //   title: "Estadística",
      //   icon: BarChart3,
      //   requiresData: true,
      // },
      {
        id: "comunidades-plantillas",
        title: "Plantillas",
        icon: FileText,
      },
    ],
  },
  // Auditorías - Subniveles en sidebar
  {
    id: "auditorias",
    title: "Auditorías",
    icon: Shield,
    children: [
      {
        id: "auditorias-estadistica",
        title: "Estadística",
        icon: BarChart3,
        requiresData: true, // Bloqueado si no hay datos
      },
      {
        id: "auditorias-formularios",
        title: "Formularios",
        icon: FileText,
        requiresData: true, // Solo si hay formularios
      },
      {
        id: "auditorias-tablero-consolidado",
        title: "Status de Hallazgos",
        icon: Activity,
      },
    ],
  },
  // Abrazando Leyendas - Clic directo (sin subniveles)
  {
    id: "abrazando-leyendas",
    title: "Abrazando Leyendas",
    icon: Heart,
  },
  {
    id: "voluntariado",
    title: "Voluntariado",
    icon: UserCheck,
    children: [
      {
        id: "voluntariado-estadistica",
        title: "Estadística",
        icon: BarChart3,
      },
      {
        id: "voluntariado-formularios",
        title: "Formularios",
        icon: FileText,
      },
      {
        id: "voluntariado-tablero",
        title: "Consolidado",
        icon: FileText,
      },
    ],
  },
];

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function AppSidebar({
  activeSection,
  setActiveSection,
}: AppSidebarProps) {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { canViewSection, isAdmin, loading } = useUserPermissions();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleProfile = () => {
    setActiveSection("perfil");
  };

  const handleSettings = () => {
    setActiveSection("configuracion");
  };

  return (
    <Sidebar className="border-r border-purple-200/50 bg-linear-to-b from-white via-purple-50/30 to-blue-50/30 shadow-xl">
      <SidebarHeader className="shrink-0 border-b border-purple-200/50 px-6 py-4 bg-linear-to-r from-white to-purple-50/50">
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
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto px-4 py-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-700 font-semibold mb-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-linear-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span>Navegación Principal</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item, index) => {
                    // Filter children based on permissions
                    const visibleChildren = item.children
                      ? item.children.filter((subItem) =>
                          canViewSection(subItem.id as SectionKey)
                        )
                      : null

                    // Skip parent item if no children are visible
                    if (item.children && visibleChildren && visibleChildren.length === 0) {
                      return null
                    }

                    // Skip single items if user doesn't have permission
                    if (!item.children && !canViewSection(item.id as SectionKey)) {
                      return null
                    }

                    return (
                      <SidebarMenuItem key={item.id}>
                        {item.children ? (
                          <div>
                            <SidebarMenuButton
                              onClick={() => toggleExpanded(item.id)}
                              className="w-full justify-start text-gray-700 hover:bg-linear-to-r hover:from-purple-100 hover:to-pink-100 hover:text-gray-900 rounded-lg transition-all duration-300 mb-1"
                            >
                              <item.icon className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">{item.title}</span>
                              <ChevronDown
                                className={`ml-auto h-4 w-4 transition-transform ${
                                  expandedItems.includes(item.id) ? "rotate-180" : ""
                                }`}
                              />
                            </SidebarMenuButton>
                            {expandedItems.includes(item.id) && visibleChildren && (
                              <div className="ml-6 mt-1 space-y-1">
                                {visibleChildren.map((subItem) => (
                                  <SidebarMenuButton
                                    key={subItem.id}
                                    isActive={activeSection === subItem.id}
                                    onClick={() => setActiveSection(subItem.id)}
                                    className={`
                                      w-full justify-start text-gray-600 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 hover:text-gray-800 rounded-lg transition-all duration-300
                                      ${
                                        activeSection === subItem.id
                                          ? "bg-linear-to-r from-purple-400 to-pink-400 text-white shadow-md hover:from-purple-500 hover:to-pink-500"
                                          : ""
                                      }
                                    `}
                                  >
                                    <subItem.icon
                                      className={`h-3 w-3 ${
                                        activeSection === subItem.id
                                          ? "text-white"
                                          : "text-gray-500"
                                      }`}
                                    />
                                    <span className="text-sm font-medium">
                                      {subItem.title}
                                    </span>
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
                              w-full justify-start text-gray-700 hover:bg-linear-to-r hover:from-purple-100 hover:to-pink-100 hover:text-gray-900 rounded-lg transition-all duration-300 mb-1
                              ${
                                activeSection === item.id
                                  ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600"
                                  : ""
                              }
                            `}
                            style={{
                              animationDelay: `${index * 0.1}s`,
                            }}
                          >
                            <item.icon
                              className={`h-4 w-4 ${
                                activeSection === item.id
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            />
                            <span className="font-medium">{item.title}</span>
                            {activeSection === item.id && (
                              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            )}
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-red-700 font-semibold mb-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-linear-to-r from-red-500 to-orange-500 rounded-full"></div>
                  <span>Administración</span>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeSection === "admin-panel"}
                        onClick={() => setActiveSection("admin-panel")}
                        className={`
                          w-full justify-start text-gray-700 hover:bg-linear-to-r hover:from-red-100 hover:to-orange-100 hover:text-gray-900 rounded-lg transition-all duration-300 mb-1
                          ${
                            activeSection === "admin-panel"
                              ? "bg-linear-to-r from-red-500 to-orange-500 text-white shadow-lg hover:from-red-600 hover:to-orange-600"
                              : ""
                          }
                        `}
                      >
                        <Lock
                          className={`h-4 w-4 ${
                            activeSection === "admin-panel"
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        />
                        <span className="font-medium">Panel de Admin</span>
                        {activeSection === "admin-panel" && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="shrink-0 border-t border-purple-200/50 p-4 bg-linear-to-r from-white to-purple-50/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full h-auto py-3 text-gray-700 hover:bg-linear-to-r hover:from-purple-100 hover:to-blue-100 rounded-lg transition-all duration-300">
                  <div className="h-8 w-8 rounded-full ring-2 ring-purple-400 flex items-center justify-center bg-purple-50 overflow-hidden shrink-0">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-semibold text-purple-700 truncate w-full">
                      {user?.user_metadata?.name ||
                        user?.email?.split("@")[0] ||
                        "Usuario"}
                    </span>
                    <span className="text-xs text-gray-500 truncate w-full">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 text-purple-600 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] backdrop-blur-sm bg-white/95 border-2 border-purple-200 shadow-lg"
              >
                <DropdownMenuItem
                  onClick={handleProfile}
                  className="hover:bg-linear-to-r hover:from-purple-100 hover:to-blue-100 cursor-pointer transition-all py-2.5"
                >
                  <User className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="text-gray-700 font-medium">Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSettings}
                  className="hover:bg-linear-to-r hover:from-purple-100 hover:to-blue-100 cursor-pointer transition-all py-2.5"
                >
                  <Settings className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="text-gray-700 font-medium">
                    Configuración
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="hover:bg-linear-to-r hover:from-red-100 hover:to-pink-100 cursor-pointer transition-all py-2.5"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-gray-700 font-medium">
                    Cerrar Sesión
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

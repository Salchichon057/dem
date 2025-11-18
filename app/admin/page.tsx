"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Users, 
  MapPin, 
  FileText, 
  UserPlus, 
  Database,
  Settings
} from "lucide-react"
// Componentes movidos a carpeta admin/ (algunos ya fueron eliminados)
// AdminComunidadesSection, AdminOrganizacionesSection, AdminEstadisticasSection, AdminUsuariosSection
// fueron eliminados porque usaban Prisma o tenían datos dummy
import { AdminBeneficiariosSection } from "@/components/admin/beneficiarios-section"
import { AdminVoluntariosSection } from "@/components/admin/voluntarios-section"
import { AdminFormulariosSection } from "@/components/admin/formularios-section"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("beneficiarios")

  const estadisticasGenerales = {
    comunidades: 24,
    organizaciones: 8,
    beneficiarios: 156,
    voluntarios: 89,
    formularios: 45,
    auditorias: 12,
    usuarios: 25
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <p className="text-gray-600">Gestiona comunidades, organizaciones y todos los datos del sistema</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{estadisticasGenerales.comunidades}</p>
              <p className="text-xs text-blue-600">Comunidades</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{estadisticasGenerales.organizaciones}</p>
              <p className="text-xs text-green-600">Organizaciones</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{estadisticasGenerales.beneficiarios}</p>
              <p className="text-xs text-purple-600">Beneficiarios</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <UserPlus className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">{estadisticasGenerales.voluntarios}</p>
              <p className="text-xs text-orange-600">Voluntarios</p>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-pink-700">{estadisticasGenerales.formularios}</p>
              <p className="text-xs text-pink-600">Formularios</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <Database className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-indigo-700">{estadisticasGenerales.auditorias}</p>
              <p className="text-xs text-indigo-600">Auditorías</p>
            </CardContent>
          </Card>
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-teal-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-teal-700">{estadisticasGenerales.usuarios}</p>
              <p className="text-xs text-teal-600">Usuarios</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Administración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Gestión de Datos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="beneficiarios" className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Beneficiarios</span>
                </TabsTrigger>
                <TabsTrigger value="voluntarios" className="flex items-center space-x-1">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Voluntarios</span>
                </TabsTrigger>
                <TabsTrigger value="formularios" className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Formularios</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="beneficiarios">
                  <AdminBeneficiariosSection />
                </TabsContent>
                <TabsContent value="voluntarios">
                  <AdminVoluntariosSection />
                </TabsContent>
                <TabsContent value="formularios">
                  <AdminFormulariosSection />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

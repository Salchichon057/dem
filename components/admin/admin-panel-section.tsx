"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Building2, 
  Users, 
  MapPin, 
  FileText, 
  UserPlus, 
  Database,
  Settings,
  Heart,
  Shield,
  Loader2
} from "lucide-react"
import { AdminUsersSection } from "@/components/admin/admin-users-section"
import { AdminFormsSection } from "@/components/admin/admin-forms-section"
import { useAdminStats } from "@/hooks/use-admin-stats"

export function AdminPanelSection() {
  const { generalStats, sectionStats, loading } = useAdminStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-600">Gestiona comunidades, organizaciones y todos los datos del sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{generalStats?.submissions_organizaciones || 0}</p>
            <p className="text-xs text-green-600">Organizaciones</p>
            <p className="text-[10px] text-gray-500">{generalStats?.forms_organizaciones || 0} {(generalStats?.forms_organizaciones || 0) === 1 ? "formulario" : "formularios"}</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-700">{generalStats?.submissions_auditorias || 0}</p>
            <p className="text-xs text-indigo-600">Auditorías</p>
            <p className="text-[10px] text-gray-500">{generalStats?.forms_auditorias || 0} {(generalStats?.forms_auditorias || 0) === 1 ? "formulario" : "formularios"}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{generalStats?.submissions_perfil_comunitario || 0}</p>
            <p className="text-xs text-blue-600">P. Comunitario</p>
            <p className="text-[10px] text-gray-500">{generalStats?.forms_perfil_comunitario || 0} {(generalStats?.forms_perfil_comunitario || 0) === 1 ? "formulario" : "formularios"}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <UserPlus className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{generalStats?.submissions_voluntariado || 0}</p>
            <p className="text-xs text-orange-600">Voluntariado</p>
            <p className="text-[10px] text-gray-500">{generalStats?.forms_voluntariado || 0} {(generalStats?.forms_voluntariado || 0) === 1 ? "formulario" : "formularios"}</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-cyan-700">{generalStats?.submissions_comunidades || 0}</p>
            <p className="text-xs text-cyan-600">Comunidades</p>
            <p className="text-[10px] text-gray-500">{generalStats?.forms_comunidades || 0} {(generalStats?.forms_comunidades || 0) === 1 ? "formulario" : "formularios"}</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-pink-700">{generalStats?.submissions_abrazando_leyendas || 0}</p>
            <p className="text-xs text-pink-600">A. Leyendas</p>
            <p className="text-[10px] text-gray-500">{generalStats?.forms_abrazando_leyendas || 0} {(generalStats?.forms_abrazando_leyendas || 0) === 1 ? "formulario" : "formularios"}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{generalStats?.total_beneficiaries || 0}</p>
            <p className="text-xs text-purple-600">Beneficiarios</p>
          </CardContent>
        </Card>
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-teal-700">{generalStats?.total_users || 0}</p>
            <p className="text-xs text-teal-600">Usuarios</p>
            <p className="text-[10px] text-gray-500">{generalStats?.total_admins || 0}A {generalStats?.total_editors || 0}E {generalStats?.total_viewers || 0}V</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Formularios por Sección</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectionStats.map((stat) => (
                <div key={stat.section} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{stat.section_name}</p>
                    <p className="text-sm text-gray-500">{stat.forms_count} formularios activos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{stat.submissions_count}</p>
                    <p className="text-xs text-gray-500">respuestas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-teal-600" />
              <span>Resumen General</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total de Formularios</span>
                <span className="text-3xl font-bold text-purple-600">{generalStats?.total_forms || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total de Respuestas</span>
                <span className="text-3xl font-bold text-blue-600">{generalStats?.total_submissions || 0}</span>
              </div>
              {/* Voluntarios - Deshabilitado temporalmente (no en v1) */}
              {/* <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-gray-700 font-medium">Voluntarios Activos</span>
                <span className="text-3xl font-bold text-orange-600">{generalStats?.total_volunteers || 0}</span>
              </div> */}
              <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg">
                <span className="text-gray-700 font-medium">Promedio por Formulario</span>
                <span className="text-3xl font-bold text-teal-600">
                  {generalStats?.total_forms && generalStats.total_forms > 0
                    ? Math.round(generalStats.total_submissions / generalStats.total_forms)
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gestión de Usuarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUsersSection />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Gestión de Formularios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminFormsSection />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

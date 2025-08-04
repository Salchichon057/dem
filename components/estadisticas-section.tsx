"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Building2, FileText, Activity } from "lucide-react"

const pieData = [
  { name: "Tecnología", value: 35, color: "#4F46E5" },
  { name: "Marketing", value: 25, color: "#10B981" },
  { name: "Finanzas", value: 20, color: "#F97316" }, // Cambiado a naranja
  { name: "Salud", value: 15, color: "#EF4444" },
  { name: "Educación", value: 5, color: "#8B5CF6" },
]

const monthlyData = [
  { name: "Jan", organizaciones: 20, usuarios: 2500, formularios: 150 },
  { name: "Feb", organizaciones: 22, usuarios: 2700, formularios: 160 },
  { name: "Mar", organizaciones: 25, usuarios: 2900, formularios: 170 },
  { name: "Apr", organizaciones: 27, usuarios: 3100, formularios: 180 },
  { name: "May", organizaciones: 30, usuarios: 3300, formularios: 190 },
]

export function EstadisticasSection() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Usuarios Totales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-booster-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2,847</div>
            <div className="flex items-center text-xs text-booster-green">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Organizaciones</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-green/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-booster-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">28</div>
            <div className="flex items-center text-xs text-booster-green">
              <TrendingUp className="mr-1 h-3 w-3" />
              +3 nuevas este mes
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Formularios</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-orange/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-booster-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">189</div>
            <div className="flex items-center text-xs text-booster-green">
              <TrendingUp className="mr-1 h-3 w-3" />
              +22 completados hoy
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Tasa de Actividad</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-red/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-booster-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">87.3%</div>
            <div className="flex items-center text-xs text-booster-red">
              <TrendingDown className="mr-1 h-3 w-3" />
              -2.1% desde ayer
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Crecimiento Mensual</CardTitle>
            <CardDescription className="text-gray-600">
              Evolución de organizaciones, usuarios y formularios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="organizaciones" stroke="#4F46E5" strokeWidth={2} name="Organizaciones" />
                <Line type="monotone" dataKey="usuarios" stroke="#10B981" strokeWidth={2} name="Usuarios" />
                <Line type="monotone" dataKey="formularios" stroke="#F97316" strokeWidth={2} name="Formularios" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Distribución por Sector</CardTitle>
            <CardDescription className="text-gray-600">
              Porcentaje de organizaciones por tipo de industria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-900">Rendimiento del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">CPU Usage</span>
                <span className="text-gray-900">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Memory</span>
                <span className="text-gray-900">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Storage</span>
                <span className="text-gray-900">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-900">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Nueva organización registrada</p>
                  <p className="text-gray-600">Hace 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">15 formularios completados</p>
                  <p className="text-gray-600">Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Actualización del sistema</p>
                  <p className="text-gray-600">Hace 3 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-900">Objetivos Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Nuevas Organizaciones</span>
                <span className="text-gray-900">8/10</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Formularios Procesados</span>
                <span className="text-gray-900">189/200</span>
              </div>
              <Progress value={94.5} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Satisfacción Usuario</span>
                <span className="text-gray-900">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, MapPin, TrendingUp, Home, Baby } from "lucide-react"
import { obtenerComunidades, obtenerEstadisticas, type Comunidad, type Estadistica, manejarErrorApi } from "@/lib/api"
import { toast } from "sonner"

export function EstadisticasComunidadesSection() {
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await obtenerComunidades()
      setComunidades(data)
    } catch (error) {
      toast.error(`Error cargando datos: ${manejarErrorApi(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estadísticas
  const totalComunidades = comunidades.length
  const comunidadesActivas = comunidades.filter(c => c.activa === true).length
  const totalFamilias = comunidades.reduce((acc, c) => acc + (c.cantidadFamiliasComunidad || 0), 0)
  const totalFamiliasRA = comunidades.reduce((acc, c) => acc + (c.cantidadFamRA || 0), 0)
  const totalPoblacion = comunidades.reduce((acc, c) => acc + 
    (c.primeraInfanciaMujeres || 0) + 
    (c.primeraInfanciaHombres || 0) + 
    (c.ninez3a5Mujeres || 0) + 
    (c.ninez3a5Hombres || 0) + 
    (c.jovenes6a10Mujeres || 0) + 
    (c.jovenes6a10Hombres || 0) + 
    (c.adultos11a18Mujeres || 0) + 
    (c.adultos11a18Hombres || 0) + 
    (c.adultos19a60Mujeres || 0) + 
    (c.adultos19a60Hombres || 0) + 
    (c.adultoMayor61Mujeres || 0) + 
    (c.adultoMayor61Hombres || 0), 0)

  // Distribución por departamentos
  const distribucionDepartamento = comunidades.reduce((acc, c) => {
    const depto = c.departamento || 'No especificado'
    acc[depto] = (acc[depto] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topDepartamentos = Object.entries(distribucionDepartamento)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Distribución por clasificación
  const distribucionClasificacion = comunidades.reduce((acc, c) => {
    const clasificacion = c.clasificacion || 'No especificada'
    acc[clasificacion] = (acc[clasificacion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const calcularPorcentaje = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) : "0.0"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas de comunidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Comunidades</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalComunidades}</div>
            <p className="text-xs text-blue-600 mt-1">
              {comunidadesActivas} activas ({calcularPorcentaje(comunidadesActivas, totalComunidades)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Familias</CardTitle>
            <Home className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalFamilias.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              Promedio: {Math.round(totalFamilias / Math.max(totalComunidades, 1))} por comunidad
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Familias en RA</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{totalFamiliasRA.toLocaleString()}</div>
            <p className="text-xs text-orange-600 mt-1">
              {calcularPorcentaje(totalFamiliasRA, totalFamilias)}% del total de familias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Población Total</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{totalPoblacion.toLocaleString()}</div>
            <p className="text-xs text-purple-600 mt-1">
              Promedio: {Math.round(totalPoblacion / Math.max(totalComunidades, 1))} por comunidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de distribución por departamento */}
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Distribución por Departamento
          </CardTitle>
          <CardDescription className="text-purple-100">
            Comunidades registradas por ubicación geográfica
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {topDepartamentos.map(([departamento, cantidad], index) => (
              <div key={departamento} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                    'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-700">{departamento}</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${calcularPorcentaje(cantidad, totalComunidades)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="font-bold text-gray-900">{cantidad}</div>
                  <div className="text-xs text-gray-500">
                    {calcularPorcentaje(cantidad, totalComunidades)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución por clasificación */}
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución por Tamaño de Comunidad
          </CardTitle>
          <CardDescription>Clasificación basada en número de familias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(distribucionClasificacion).map(([clasificacion, cantidad]) => (
              <div key={clasificacion} className="text-center p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-2xl font-bold text-gray-900 mb-1">{cantidad}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{clasificacion}</div>
                <div className="text-xs text-gray-500">
                  {calcularPorcentaje(cantidad, totalComunidades)}% del total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demografía por grupos de edad */}
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Distribución Demográfica
          </CardTitle>
          <CardDescription>Población por grupos de edad y género</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-blue-900">
                {comunidades.reduce((acc, c) => acc + (c.primeraInfanciaMujeres || 0) + (c.primeraInfanciaHombres || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs font-medium text-blue-700">Primera Infancia</div>
              <div className="text-xs text-blue-600">(0-2 años)</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="text-lg font-bold text-green-900">
                {comunidades.reduce((acc, c) => acc + (c.ninez3a5Mujeres || 0) + (c.ninez3a5Hombres || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs font-medium text-green-700">Niñez</div>
              <div className="text-xs text-green-600">(3-5 años)</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-lg font-bold text-yellow-900">
                {comunidades.reduce((acc, c) => acc + (c.jovenes6a10Mujeres || 0) + (c.jovenes6a10Hombres || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs font-medium text-yellow-700">Jóvenes</div>
              <div className="text-xs text-yellow-600">(6-10 años)</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-lg font-bold text-purple-900">
                {comunidades.reduce((acc, c) => acc + (c.adultos11a18Mujeres || 0) + (c.adultos11a18Hombres || 0) + (c.adultos19a60Mujeres || 0) + (c.adultos19a60Hombres || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs font-medium text-purple-700">Adultos</div>
              <div className="text-xs text-purple-600">(11-60 años)</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-lg font-bold text-gray-900">
                {comunidades.reduce((acc, c) => acc + (c.adultoMayor61Mujeres || 0) + (c.adultoMayor61Hombres || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs font-medium text-gray-700">Adultos Mayores</div>
              <div className="text-xs text-gray-600">(61+ años)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comunidades recientes */}
      <Card className="shadow-lg border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Comunidades Recientes</CardTitle>
          <CardDescription>Últimas comunidades registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comunidades.slice(0, 5).map((comunidad) => (
              <div key={comunidad.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {comunidad.municipio?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{comunidad.lider || 'Líder no especificado'}</div>
                    <div className="text-sm text-gray-500">{comunidad.departamento} - {comunidad.municipio}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {comunidad.cantidadFamiliasComunidad || 0} familias
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comunidad.activa 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {comunidad.activa ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

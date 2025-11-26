"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TrafficLightStats {
  total: number;
  rojo: number;
  amarillo: number;
  verde: number;
  sin_definir: number;
  por_mes: Array<{
    mes: string;
    rojo: number;
    amarillo: number;
    verde: number;
  }>;
  seguimiento: {
    con_seguimiento: number;
    sin_seguimiento: number;
  };
  concluidos: {
    si: number;
    no: number;
    sin_definir: number;
  };
}

const COLORS = {
  rojo: "#ef4444",
  amarillo: "#eab308",
  verde: "#22c55e",
  sin_definir: "#94a3b8",
};

export function SemaforoEstadisticas() {
  const [stats, setStats] = useState<TrafficLightStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/board-extras/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas del semáforo...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Datos para gráfico de pie
  const pieData = [
    { name: "Rojo", value: stats.rojo, color: COLORS.rojo },
    { name: "Amarillo", value: stats.amarillo, color: COLORS.amarillo },
    { name: "Verde", value: stats.verde, color: COLORS.verde },
    {
      name: "Sin definir",
      value: stats.sin_definir,
      color: COLORS.sin_definir,
    },
  ].filter((item) => item.value > 0);

  // Datos para gráfico de barras de seguimiento
  const seguimientoData = [
    {
      name: "Con Seguimiento",
      value: stats.seguimiento.con_seguimiento,
      fill: "#22c55e",
    },
    {
      name: "Sin Seguimiento",
      value: stats.seguimiento.sin_seguimiento,
      fill: "#ef4444",
    },
  ];

  const porcentajeRojo =
    stats.total > 0 ? ((stats.rojo / stats.total) * 100).toFixed(1) : "0";
  const porcentajeAmarillo =
    stats.total > 0 ? ((stats.amarillo / stats.total) * 100).toFixed(1) : "0";
  const porcentajeVerde =
    stats.total > 0 ? ((stats.verde / stats.total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Estadísticas del Semáforo
        </h1>
        <p className="text-gray-600 mt-2">
          Análisis de hallazgos y seguimiento de auditorías
        </p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Auditorías
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              registros en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              🔴 Hallazgos Altos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rojo}</div>
            <p className="text-xs text-red-600">{porcentajeRojo}% del total</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              🟡 Hallazgos Medios
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.amarillo}
            </div>
            <p className="text-xs text-yellow-600">
              {porcentajeAmarillo}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              🟢 Hallazgos Bajos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.verde}
            </div>
            <p className="text-xs text-green-600">
              {porcentajeVerde}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pie - Distribución de Semáforo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Hallazgos</CardTitle>
            <CardDescription>Por categoría de severidad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
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

        {/* Gráfico de Barras - Seguimiento */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Seguimiento</CardTitle>
            <CardDescription>Auditorías con y sin seguimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seguimientoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

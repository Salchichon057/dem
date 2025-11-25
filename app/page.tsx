export default function RootPage() {
  // La redirección es manejada por el middleware
  // Este componente solo se renderiza brevemente antes de la redirección
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Redirigiendo...</p>
      </div>
    </div>
  )
}

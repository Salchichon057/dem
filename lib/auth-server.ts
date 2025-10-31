import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verificar JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion'
    )

    const { payload } = await jwtVerify(token, secret)
    
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string
    }
  } catch (error) {
    console.error('Error verificando JWT:', error)
    return null
  }
}

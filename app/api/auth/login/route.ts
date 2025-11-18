import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateToken, excludePassword } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando proceso de login...')
    
    const body = await request.json()
    console.log('📝 Datos recibidos:', { email: body.email })
    
    // Validar datos de entrada
    const validatedData = loginSchema.parse(body)
    console.log('✅ Datos validados correctamente')
    
    // Probar conexión a base de datos
    await prisma.$connect()
    console.log('🔌 Conectado a la base de datos')
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No')
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    
    // Verificar contraseña
    const isPasswordValid = await verifyPassword(validatedData.password, user.password)
    console.log('🔐 Contraseña válida:', isPasswordValid ? 'Sí' : 'No')
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    
    // Generar token
    const token = generateToken(user.id)
    console.log('🎫 Token generado exitosamente')
    
    // Retornar usuario sin contraseña
    const safeUser = excludePassword(user)
    
    return NextResponse.json({
      user: safeUser,
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

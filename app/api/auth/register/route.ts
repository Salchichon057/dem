import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateToken, excludePassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando proceso de registro...')
    
    const body = await request.json()
    console.log('📝 Datos recibidos:', { email: body.email, name: body.name })
    
    // Validar datos de entrada
    const validatedData = registerSchema.parse(body)
    console.log('✅ Datos validados correctamente')
    
    // Probar conexión a base de datos
    await prisma.$connect()
    console.log('🔌 Conectado a la base de datos')
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    console.log('👤 Usuario existente:', existingUser ? 'Sí' : 'No')
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe con este email' },
        { status: 400 }
      )
    }
    
    // Hash de la contraseña
    const hashedPassword = await hashPassword(validatedData.password)
    console.log('🔐 Contraseña hasheada exitosamente')
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      }
    })
    
    console.log('✨ Usuario creado exitosamente:', user.id)
    
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
    
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

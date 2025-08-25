import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🔍 Creando usuarios de prueba...')
    
    // Crear contraseña hasheada
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // Verificar si galileo.laino@gmail.com ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'galileo.laino@gmail.com' }
    })
    
    if (existingUser) {
      console.log('👤 Usuario galileo.laino@gmail.com ya existe')
    } else {
      // Crear usuario galileo.laino@gmail.com
      const galileoUser = await prisma.user.create({
        data: {
          email: 'galileo.laino@gmail.com',
          password: hashedPassword,
          name: 'Galileo Laino',
        }
      })
      console.log('✅ Usuario creado:', galileoUser.email)
    }
    
    // Crear usuario de prueba adicional
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Usuario de Prueba',
      }
    })
    console.log('✅ Usuario de prueba creado/actualizado:', testUser.email)
    
    // Mostrar todos los usuarios
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('📋 Usuarios en la base de datos:')
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - ID: ${user.id}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()

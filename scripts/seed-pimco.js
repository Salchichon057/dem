const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const comunidadesMuestra = [
  {
    nombreComunidad: 'Santa Lucia Los Ototes',
    departamento: 'Guatemala',
    municipio: 'Guatemala',
    corregimiento: 'Zona 18',
    vereda: 'Los Ototes',
    numeroFamilias: 45,
    numeroPersonas: 180,
    coordinadorComunitario: 'María Elena García',
    telefonoCoordinador: '+502 3012-3456',
    estado: 'ACTIVO',
    observaciones: 'Comunidad con alta participación en programas sociales'
  },
  {
    nombreComunidad: 'San Juan Sacatepequez Iz de Carranza',
    departamento: 'Guatemala',
    municipio: 'San Juan Sacatepéquez',
    corregimiento: 'Iz de Carranza',
    vereda: 'El Centro',
    numeroFamilias: 32,
    numeroPersonas: 128,
    coordinadorComunitario: 'Gloria Magdalena Caracún',
    telefonoCoordinador: '+502 3109-8765',
    estado: 'ACTIVO',
    observaciones: 'Necesidades en infraestructura vial'
  },
  {
    nombreComunidad: 'Mixco Tierra Nueva I',
    departamento: 'Guatemala',
    municipio: 'Mixco',
    corregimiento: 'Tierra Nueva',
    vereda: 'Sector I',
    numeroFamilias: 28,
    numeroPersonas: 112,
    coordinadorComunitario: 'Carlos Andrés Pérez',
    telefonoCoordinador: '+502 3204-5678',
    estado: 'EN_PROCESO',
    observaciones: 'En proceso de legalización de terrenos'
  },
  {
    nombreComunidad: 'San Juan Sacatepequez Sajcaville',
    departamento: 'Guatemala',
    municipio: 'San Juan Sacatepéquez',
    corregimiento: 'Sajcaville',
    vereda: 'El Progreso',
    numeroFamilias: 38,
    numeroPersonas: 152,
    coordinadorComunitario: 'Ana Sofía Rodríguez',
    telefonoCoordinador: '+502 3152-3456',
    estado: 'ACTIVO',
    observaciones: 'Excelente organización comunitaria'
  }
]

const entrevistasMuestra = [
  // Santa Lucia Los Ototes - 15 entrevistas
  ...Array.from({length: 8}, (_, i) => ({
    fechaEncuesta: new Date(2024, 3 + Math.floor(i/2), 15 + i),
    estadoVisita: 'PRIMERA_VISITA',
    nombreEncargado: 'Estefanie Reyes',
    sexoEntrevistado: i % 3 === 0 ? 'Masculino' : 'Femenino',
    fechaNacimiento: new Date(1960 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: ['Ama (o) de casa', 'Jorna (era)', 'Trabajo Informal', 'Cazador'][i % 4],
    observaciones: 'Primera visita realizada exitosamente'
  })),
  ...Array.from({length: 7}, (_, i) => ({
    fechaEncuesta: new Date(2024, 5 + Math.floor(i/2), 10 + i),
    estadoVisita: 'VISITA_SEGUIMIENTO',
    nombreEncargado: 'Estefanie Reyes',
    sexoEntrevistado: i % 2 === 0 ? 'Femenino' : 'Masculino',
    fechaNacimiento: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: ['Ama (o) de casa', 'Comerciante', 'Taller de costura'][i % 3],
    observaciones: 'Seguimiento de primera visita'
  })),

  // San Juan Sacatepequez Iz de Carranza - 18 entrevistas
  ...Array.from({length: 10}, (_, i) => ({
    fechaEncuesta: new Date(2024, 4 + Math.floor(i/3), 5 + i),
    estadoVisita: 'PRIMERA_VISITA',
    nombreEncargado: 'Gloria Magdalena Caracún',
    sexoEntrevistado: 'Femenino',
    fechaNacimiento: new Date(1965 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: ['Ama (o) de casa', 'Jorna (era)', 'Agricultor'][i % 3],
    observaciones: 'Entrevista inicial completa'
  })),
  ...Array.from({length: 8}, (_, i) => ({
    fechaEncuesta: new Date(2024, 6 + Math.floor(i/2), 12 + i),
    estadoVisita: 'VISITA_SEGUIMIENTO',
    nombreEncargado: 'Gloria Magdalena Caracún',
    sexoEntrevistado: i % 4 === 0 ? 'Masculino' : 'Femenino',
    fechaNacimiento: new Date(1975 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: ['Trabajo Informal', 'Carpintero', 'Ama (o) de casa'][i % 3],
    observaciones: 'Seguimiento programado'
  })),

  // Mixco Tierra Nueva I - 6 entrevistas
  ...Array.from({length: 4}, (_, i) => ({
    fechaEncuesta: new Date(2024, 7, 20 + i * 2),
    estadoVisita: 'PRIMERA_VISITA',
    nombreEncargado: 'Estefanie Reyes',
    sexoEntrevistado: 'Femenino',
    fechaNacimiento: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: ['Ama (o) de casa', 'Taller de costura'][i % 2],
    observaciones: 'Primera visita en nueva comunidad'
  })),
  ...Array.from({length: 2}, (_, i) => ({
    fechaEncuesta: new Date(2024, 8, 5 + i * 3),
    estadoVisita: 'VISITA_SEGUIMIENTO',
    nombreEncargado: 'Estefanie Reyes',
    sexoEntrevistado: 'Femenino',
    fechaNacimiento: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: 'Trabajo Informal',
    observaciones: 'Seguimiento programado'
  })),

  // San Juan Sacatepequez Sajcaville - 2 entrevistas
  ...Array.from({length: 2}, (_, i) => ({
    fechaEncuesta: new Date(2024, 8, 25 + i),
    estadoVisita: 'PRIMERA_VISITA',
    nombreEncargado: 'Estefanie Reyes',
    sexoEntrevistado: 'Femenino',
    fechaNacimiento: new Date(1975 + i * 10, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ocupacionJefeHogar: 'Ama (o) de casa',
    observaciones: 'Comunidad recién incorporada'
  }))
]

async function cargarDatosMuestra() {
  try {
    console.log('🔄 Iniciando carga de datos de muestra para PIMCO...')

    // Limpiar datos existentes
    await prisma.entrevistaPimco.deleteMany()
    await prisma.comunidadPimco.deleteMany()
    console.log('🗑️ Datos existentes eliminados')

    // Crear comunidades
    console.log('🏘️ Creando comunidades...')
    const comunidadesCreadas = []
    for (const comunidad of comunidadesMuestra) {
      const nuevaComunidad = await prisma.comunidadPimco.create({
        data: comunidad
      })
      comunidadesCreadas.push(nuevaComunidad)
      console.log(`✅ Comunidad creada: ${nuevaComunidad.nombreComunidad}`)
    }

    // Crear entrevistas
    console.log('📋 Creando entrevistas...')
    const comunidadIds = comunidadesCreadas.map(c => c.id)
    let entrevistaIndex = 0

    // Distribuir entrevistas por comunidad: 15, 18, 6, 2
    const entrevistasPorComunidad = [15, 18, 6, 2]
    
    for (let i = 0; i < comunidadIds.length; i++) {
      const cantidad = entrevistasPorComunidad[i]
      for (let j = 0; j < cantidad; j++) {
        await prisma.entrevistaPimco.create({
          data: {
            ...entrevistasMuestra[entrevistaIndex],
            comunidadId: comunidadIds[i]
          }
        })
        entrevistaIndex++
      }
      console.log(`✅ ${cantidad} entrevistas creadas para ${comunidadesCreadas[i].nombreComunidad}`)
    }

    console.log('✨ ¡Datos de muestra cargados exitosamente!')
    console.log(`📊 Total: ${comunidadesCreadas.length} comunidades y ${entrevistaIndex} entrevistas`)

  } catch (error) {
    console.error('❌ Error al cargar datos de muestra:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cargarDatosMuestra()

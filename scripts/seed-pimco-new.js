const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const comunidadesPimcoData = [
  {
    departamento: "Guatemala",
    municipio: "San Juan Sacatepéquez",
    aldeas: "Aldea Los Pinos",
    caseriosQueAtienden: "Caserío El Rosario, Caserío La Esperanza",
    qtyCaseriosQueAtienden: 2,
    ubicacionGoogleMaps: "https://maps.google.com/?q=14.7167,-90.6333",
    liderNumero: "María González / +502 5555-1234",
    comiteComunitario: "Comité de Desarrollo Los Pinos",
    activa: true,
    cantidadFamiliasEnComunidad: 85,
    cantidadFamEnRA: 72,
    fotografiaReferencia: "https://ejemplo.com/foto-los-pinos.jpg",
    motivoSuspencionOBaja: null
  },
  {
    departamento: "Guatemala",
    municipio: "Mixco",
    aldeas: "Aldea San José",
    caseriosQueAtienden: "Caserío Las Flores, Caserío El Mirador, Caserío La Paz",
    qtyCaseriosQueAtienden: 3,
    ubicacionGoogleMaps: "https://maps.google.com/?q=14.6303,-90.6061",
    liderNumero: "Carlos Ramírez / +502 5555-5678",
    comiteComunitario: "Comité de Bienestar San José",
    activa: true,
    cantidadFamiliasEnComunidad: 120,
    cantidadFamEnRA: 98,
    fotografiaReferencia: "https://ejemplo.com/foto-san-jose.jpg",
    motivoSuspencionOBaja: null
  },
  {
    departamento: "Guatemala",
    municipio: "Villa Nueva",
    aldeas: "Aldea La Esperanza",
    caseriosQueAtienden: "Caserío Monte Verde",
    qtyCaseriosQueAtienden: 1,
    ubicacionGoogleMaps: "https://maps.google.com/?q=14.5253,-90.5881",
    liderNumero: "Ana Martínez / +502 5555-9012",
    comiteComunitario: "Comité de Mujeres La Esperanza",
    activa: false,
    cantidadFamiliasEnComunidad: 45,
    cantidadFamEnRA: 38,
    fotografiaReferencia: "https://ejemplo.com/foto-esperanza.jpg",
    motivoSuspencionOBaja: "Falta de participación comunitaria"
  },
  {
    departamento: "Guatemala",
    municipio: "San Pedro Sacatepéquez",
    aldeas: "Aldea El Progreso",
    caseriosQueAtienden: "Caserío Nuevo Amanecer, Caserío Valle Verde, Caserío Las Brisas, Caserío El Carmen",
    qtyCaseriosQueAtienden: 4,
    ubicacionGoogleMaps: "https://maps.google.com/?q=14.7092,-90.6431",
    liderNumero: "Pedro López / +502 5555-3456",
    comiteComunitario: "Comité de Desarrollo Integral El Progreso",
    activa: true,
    cantidadFamiliasEnComunidad: 165,
    cantidadFamEnRA: 142,
    fotografiaReferencia: "https://ejemplo.com/foto-progreso.jpg",
    motivoSuspencionOBaja: null
  },
  {
    departamento: "Guatemala",
    municipio: "San Raymundo",
    aldeas: "Aldea Los Cerritos",
    caseriosQueAtienden: "Caserío La Montaña, Caserío El Llano",
    qtyCaseriosQueAtienden: 2,
    ubicacionGoogleMaps: "https://maps.google.com/?q=14.8333,-90.7167",
    liderNumero: "Lucía Morales / +502 5555-7890",
    comiteComunitario: "Comité de Agricultores Los Cerritos",
    activa: true,
    cantidadFamiliasEnComunidad: 95,
    cantidadFamEnRA: 81,
    fotografiaReferencia: "https://ejemplo.com/foto-cerritos.jpg",
    motivoSuspencionOBaja: null
  },
  {
    departamento: "Guatemala",
    municipio: "Chinautla",
    aldeas: "Aldea Santa Fe",
    caseriosQueAtienden: "Caserío La Cruz",
    qtyCaseriosQueAtienden: 1,
    ubicacionGoogleMaps: "https://maps.google.com/?q=14.7061,-90.4981",
    liderNumero: "Roberto Jiménez / +502 5555-2345",
    comiteComunitario: "Comité de Salud Santa Fe",
    activa: false,
    cantidadFamiliasEnComunidad: 38,
    cantidadFamEnRA: 25,
    fotografiaReferencia: "https://ejemplo.com/foto-santa-fe.jpg",
    motivoSuspencionOBaja: "Problemas de acceso por temporada de lluvias"
  }
];

async function main() {
  console.log('🌱 Iniciando carga de datos de prueba para PIMCO...');

  try {
    // Limpiar datos existentes
    await prisma.comunidadPimco.deleteMany();
    console.log('🗑️  Datos anteriores eliminados');

    // Crear comunidades PIMCO
    console.log('📍 Creando comunidades PIMCO...');
    for (const comunidad of comunidadesPimcoData) {
      const nuevaComunidad = await prisma.comunidadPimco.create({
        data: comunidad
      });
      console.log(`   ✅ Creada: ${nuevaComunidad.aldeas} (${nuevaComunidad.municipio})`);
    }

    console.log(`\n🎉 ¡Carga completada exitosamente!`);
    console.log(`📊 Estadísticas:`);
    console.log(`   • ${comunidadesPimcoData.length} comunidades PIMCO creadas`);
    console.log(`   • ${comunidadesPimcoData.filter(c => c.activa).length} comunidades activas`);
    console.log(`   • ${comunidadesPimcoData.filter(c => !c.activa).length} comunidades inactivas`);
    console.log(`   • ${comunidadesPimcoData.reduce((sum, c) => sum + c.cantidadFamiliasEnComunidad, 0)} familias en total`);
    console.log(`   • ${comunidadesPimcoData.reduce((sum, c) => sum + c.cantidadFamEnRA, 0)} familias en RA`);

  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
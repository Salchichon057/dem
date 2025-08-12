import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Por ahora retornamos datos de ejemplo hasta que se implemente el schema completo
    const comunidades = [
      {
        id: "1",
        fechaInscripcion: "2025-01-17",
        departamento: "Chimaltenango",
        municipio: "San José Poaquil",
        aldeas: "Aldea Haciendo a Vieja",
        caseriosAtienden: ["Hacienda vieja", "Panama"],
        qtyCaserios: 2,
        ubicacionGoogleMaps: "14.123456, -90.654321",
        lider: "Reyna Nohelia Sirin Chan",
        numeroLider: "4600 7627",
        asistenteGrupoLideres: "Sí",
        comiteComunitario: "Activo",
        activa: true,
        cantidadFamilias: 400,
        cantidadFamRA: 50,
        primeraInfanciaMujeres: 15,
        primeraInfanciaHombres: 18,
        ninez3a5Mujeres: 25,
        ninez3a5Hombres: 22,
        jovenes6a10Mujeres: 30,
        jovenes6a10Hombres: 28,
        adultos11a18Mujeres: 35,
        adultos11a18Hombres: 33,
        adultos19a60Mujeres: 45,
        adultos19a60Hombres: 42,
        adultoMayor61Mujeres: 8,
        adultoMayor61Hombres: 6,
        mujeresGestantes: 5,
        mujeresLactantes: 3,
        clasificacion: "GRANDE",
        capacidadAlmacenamiento: "500 bolsas",
        formasColocacionInteres: ["BS", "BA", "C"],
        tipoColocacion: "Mensual",
        grupoWhatsapp: "Sí",
        book: "Sí",
        bolsasMaximo: 100,
        bolsasCortesia: 10,
        createdAt: "2025-01-17T19:02:18Z",
        updatedAt: "2025-01-17T19:02:18Z"
      },
      {
        id: "2",
        fechaInscripcion: "2025-03-03",
        departamento: "Guatemala",
        municipio: "San Juan Sacatepéquez",
        aldeas: "Villas del Quetzal",
        caseriosAtienden: ["Colonia La Gotica", "Condados", "La Cienega"],
        qtyCaserios: 19,
        ubicacionGoogleMaps: "14.567890, -90.123456",
        lider: "Jefherson Isai Méndez Garcia",
        numeroLider: "3842 5977",
        asistenteGrupoLideres: "Sí",
        comiteComunitario: "Activo",
        activa: true,
        cantidadFamilias: 6,
        cantidadFamRA: 268,
        primeraInfanciaMujeres: 20,
        primeraInfanciaHombres: 25,
        ninez3a5Mujeres: 30,
        ninez3a5Hombres: 28,
        jovenes6a10Mujeres: 40,
        jovenes6a10Hombres: 38,
        adultos11a18Mujeres: 50,
        adultos11a18Hombres: 48,
        adultos19a60Mujeres: 60,
        adultos19a60Hombres: 55,
        adultoMayor61Mujeres: 12,
        adultoMayor61Hombres: 10,
        mujeresGestantes: 8,
        mujeresLactantes: 6,
        clasificacion: "GRANDE",
        capacidadAlmacenamiento: "800 bolsas",
        formasColocacionInteres: ["BS", "C", "B"],
        tipoColocacion: "Mensual",
        grupoWhatsapp: "Sí",
        book: "Sí",
        bolsasMaximo: 300,
        bolsasCortesia: 25,
        createdAt: "2025-03-03T14:40:41Z",
        updatedAt: "2025-03-03T14:40:41Z"
      }
    ]

    return NextResponse.json(comunidades)
  } catch (error) {
    console.error('Error en GET /api/comunidades:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const data = await request.json()

    // TODO: Implementar creación en base de datos cuando se actualice el schema
    const nuevaComunidad = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(nuevaComunidad, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/comunidades:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

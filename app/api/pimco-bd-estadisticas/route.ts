import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departamento = searchParams.get('departamento')
    const municipio = searchParams.get('municipio')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Construir filtros dinámicos
    const whereClause: {
      comunidad?: {
        departamento?: string;
        municipio?: string;
      };
    } = {}
    
    if (departamento && departamento !== 'all') {
      whereClause.comunidad = {
        departamento: departamento
      }
    }
    
    if (municipio && municipio !== 'all') {
      whereClause.comunidad = {
        ...whereClause.comunidad,
        municipio: municipio
      }
    }

    // Obtener total de registros para paginación
    const totalRegistros = await prisma.entrevistaPimco.count({
      where: whereClause
    })

    // Obtener entrevistas con todos los datos de la encuesta
    const entrevistas = await prisma.entrevistaPimco.findMany({
      where: whereClause,
      include: {
        comunidad: {
          select: {
            nombreComunidad: true,
            departamento: true,
            municipio: true,
            coordinadorComunitario: true
          }
        }
      },
      orderBy: {
        marcaTemporal: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Obtener lista de departamentos únicos para filtros
    const departamentos = await prisma.comunidadPimco.findMany({
      select: {
        departamento: true
      },
      distinct: ['departamento'],
      orderBy: {
        departamento: 'asc'
      }
    })

    // Obtener lista de municipios únicos para filtros
    const municipios = await prisma.comunidadPimco.findMany({
      select: {
        municipio: true,
        departamento: true
      },
      distinct: ['municipio', 'departamento'],
      orderBy: [
        { departamento: 'asc' },
        { municipio: 'asc' }
      ]
    })

    return NextResponse.json({
      entrevistas: entrevistas.map(entrevista => ({
        id: entrevista.id,
        marcaTemporal: entrevista.marcaTemporal,
        fechaEncuesta: entrevista.fechaEncuesta,
        estadoVisita: entrevista.estadoVisita,
        nombreComunidad: entrevista.comunidad?.nombreComunidad,
        departamento: entrevista.comunidad?.departamento,
        municipio: entrevista.comunidad?.municipio,
        encargadoVisita: entrevista.encargadoVisita,
        sexoEntrevistado: entrevista.sexoEntrevistado,
        fechaNacimiento: entrevista.fechaNacimiento,
        dpi: entrevista.dpi,
        edad: entrevista.edad,
        etnia: entrevista.etnia,
        escolaridad: entrevista.escolaridad,
        tipoVivienda: entrevista.tipoVivienda,
        personasHogar: entrevista.personasHogar,
        ingresoMensual: entrevista.ingresoMensual,
        personaEmbarazada: entrevista.personaEmbarazada,
        mesesEmbarazo: entrevista.mesesEmbarazo,
        personaDiscapacidad: entrevista.personaDiscapacidad,
        observacionesDiscapacidad: entrevista.observacionesDiscapacidad,
        convulsiones: entrevista.convulsiones,
        fuenteAgua: entrevista.fuenteAgua,
        frecuenciaAgua: entrevista.frecuenciaAgua,
        duracionAgua: entrevista.duracionAgua,
        distanciaAgua: entrevista.distanciaAgua,
        tiempoAgua: entrevista.tiempoAgua,
        tratamientoAgua: entrevista.tratamientoAgua,
        tipoSanitario: entrevista.tipoSanitario,
        eliminaAguasNegras: entrevista.eliminaAguasNegras,
        formaEliminacion: entrevista.formaEliminacion,
        energiaElectrica: entrevista.energiaElectrica,
        materialParedes: entrevista.materialParedes,
        materialTecho: entrevista.materialTecho,
        materialPiso: entrevista.materialPiso,
        materialPatio: entrevista.materialPatio,
        espaciosVivienda: entrevista.espaciosVivienda,
        cocinaSeparada: entrevista.cocinaSeparada,
        observacionesCocina: entrevista.observacionesCocina,
        habitosHigiene: entrevista.habitosHigiene,
        frecuenciaHigiene: entrevista.frecuenciaHigiene,
        ocupacionJefeHogar: entrevista.ocupacionJefeHogar,
        fuenteIngresoFamilia: entrevista.fuenteIngresoFamilia,
        personasTrabajan: entrevista.personasTrabajan,
        familiarExtranjero: entrevista.familiarExtranjero,
        recibeRemesas: entrevista.recibeRemesas,
        frecuenciaRemesas: entrevista.frecuenciaRemesas,
        usoRemesas: entrevista.usoRemesas,
        tieneTierra: entrevista.tieneTierra,
        alquilaTierra: entrevista.alquilaTierra,
        cultivaTierra: entrevista.cultivaTierra,
        usoCosecha: entrevista.usoCosecha,
        guardaAlimentos: entrevista.guardaAlimentos,
        alimentosGuardados: entrevista.alimentosGuardados,
        cantidadAlmacena: entrevista.cantidadAlmacena,
        tiempoDura: entrevista.tiempoDura,
        huertoFamiliar: entrevista.huertoFamiliar,
        cosechaHuerto: entrevista.cosechaHuerto,
        controlPlagas: entrevista.controlPlagas,
        metodosControl: entrevista.metodosControl,
        sistemaRiego: entrevista.sistemaRiego,
        tipoRiego: entrevista.tipoRiego,
        fuenteAguaRiego: entrevista.fuenteAguaRiego,
        accesoSalud: entrevista.accesoSalud,
        enfermerosPermanentes: entrevista.enfermerosPermanentes,
        tiempoSalud: entrevista.tiempoSalud,
        ninesMenores5: entrevista.ninesMenores5,
        controlVacunacion: entrevista.controlVacunacion,
        enfermanDiarrea: entrevista.enfermanDiarrea,
        frecuenciaDiarrea: entrevista.frecuenciaDiarrea,
        acudeSaludDiarrea: entrevista.acudeSaludDiarrea,
        enfermanRespiratorias: entrevista.enfermanRespiratorias,
        frecuenciaRespiratorias: entrevista.frecuenciaRespiratorias,
        acudeSaludRespiratorias: entrevista.acudeSaludRespiratorias,
        escalaHambre1: entrevista.escalaHambre1,
        escalaHambre2: entrevista.escalaHambre2,
        escalaHambre3: entrevista.escalaHambre3,
        tiemposComida: entrevista.tiemposComida,
        // Datos de consumo de alimentos - podrían ser campos JSON o separados
        consumoVerduras: entrevista.consumoVerduras,
        consumoFrutas: entrevista.consumoFrutas,
        consumoAzucares: entrevista.consumoAzucares,
        consumoCereales: entrevista.consumoCereales,
        consumoCarnes: entrevista.consumoCarnes,
        consumoLacteos: entrevista.consumoLacteos,
        consumoGrasas: entrevista.consumoGrasas,
        temasCapacitacion: entrevista.temasCapacitacion,
        nombreEncargado: entrevista.nombreEncargado,
        precioVenta: entrevista.precioVenta
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRegistros / limit),
        totalRegistros: totalRegistros,
        limit: limit
      },
      filtros: {
        departamentos: departamentos.map(d => d.departamento).filter(Boolean),
        municipios: municipios.map(m => ({
          municipio: m.municipio,
          departamento: m.departamento
        })).filter(m => m.municipio)
      }
    })
  } catch (error) {
    console.error('Error al obtener base de datos de estadísticas PIMCO:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Crear una nueva entrevista con todos los datos
    const nuevaEntrevista = await prisma.entrevistaPimco.create({
      data: {
        marcaTemporal: new Date(data.marcaTemporal || new Date()),
        fechaEncuesta: new Date(data.fechaEncuesta),
        estadoVisita: data.estadoVisita,
        comunidadId: data.comunidadId,
        encargadoVisita: data.encargadoVisita,
        sexoEntrevistado: data.sexoEntrevistado,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        dpi: data.dpi,
        edad: data.edad,
        etnia: data.etnia,
        escolaridad: data.escolaridad,
        tipoVivienda: data.tipoVivienda,
        personasHogar: data.personasHogar,
        ingresoMensual: data.ingresoMensual,
        personaEmbarazada: data.personaEmbarazada,
        mesesEmbarazo: data.mesesEmbarazo,
        personaDiscapacidad: data.personaDiscapacidad,
        observacionesDiscapacidad: data.observacionesDiscapacidad,
        convulsiones: data.convulsiones,
        // ... resto de campos de la encuesta
        fuenteAgua: data.fuenteAgua,
        frecuenciaAgua: data.frecuenciaAgua,
        duracionAgua: data.duracionAgua,
        distanciaAgua: data.distanciaAgua,
        tiempoAgua: data.tiempoAgua,
        tratamientoAgua: data.tratamientoAgua,
        tipoSanitario: data.tipoSanitario,
        eliminaAguasNegras: data.eliminaAguasNegras,
        formaEliminacion: data.formaEliminacion,
        energiaElectrica: data.energiaElectrica,
        materialParedes: data.materialParedes,
        materialTecho: data.materialTecho,
        materialPiso: data.materialPiso,
        materialPatio: data.materialPatio,
        espaciosVivienda: data.espaciosVivienda,
        cocinaSeparada: data.cocinaSeparada,
        observacionesCocina: data.observacionesCocina,
        habitosHigiene: data.habitosHigiene,
        frecuenciaHigiene: data.frecuenciaHigiene,
        ocupacionJefeHogar: data.ocupacionJefeHogar,
        fuenteIngresoFamilia: data.fuenteIngresoFamilia,
        personasTrabajan: data.personasTrabajan,
        familiarExtranjero: data.familiarExtranjero,
        recibeRemesas: data.recibeRemesas,
        frecuenciaRemesas: data.frecuenciaRemesas,
        usoRemesas: data.usoRemesas,
        tieneTierra: data.tieneTierra,
        alquilaTierra: data.alquilaTierra,
        cultivaTierra: data.cultivaTierra,
        usoCosecha: data.usoCosecha,
        guardaAlimentos: data.guardaAlimentos,
        alimentosGuardados: data.alimentosGuardados,
        cantidadAlmacena: data.cantidadAlmacena,
        tiempoDura: data.tiempoDura,
        huertoFamiliar: data.huertoFamiliar,
        cosechaHuerto: data.cosechaHuerto,
        controlPlagas: data.controlPlagas,
        metodosControl: data.metodosControl,
        sistemaRiego: data.sistemaRiego,
        tipoRiego: data.tipoRiego,
        fuenteAguaRiego: data.fuenteAguaRiego,
        accesoSalud: data.accesoSalud,
        enfermerosPermanentes: data.enfermerosPermanentes,
        tiempoSalud: data.tiempoSalud,
        ninesMenores5: data.ninesMenores5,
        controlVacunacion: data.controlVacunacion,
        enfermanDiarrea: data.enfermanDiarrea,
        frecuenciaDiarrea: data.frecuenciaDiarrea,
        acudeSaludDiarrea: data.acudeSaludDiarrea,
        enfermanRespiratorias: data.enfermanRespiratorias,
        frecuenciaRespiratorias: data.frecuenciaRespiratorias,
        acudeSaludRespiratorias: data.acudeSaludRespiratorias,
        escalaHambre1: data.escalaHambre1,
        escalaHambre2: data.escalaHambre2,
        escalaHambre3: data.escalaHambre3,
        tiemposComida: data.tiemposComida,
        consumoVerduras: data.consumoVerduras,
        consumoFrutas: data.consumoFrutas,
        consumoAzucares: data.consumoAzucares,
        consumoCereales: data.consumoCereales,
        consumoCarnes: data.consumoCarnes,
        consumoLacteos: data.consumoLacteos,
        consumoGrasas: data.consumoGrasas,
        temasCapacitacion: data.temasCapacitacion,
        nombreEncargado: data.nombreEncargado,
        precioVenta: data.precioVenta
      },
      include: {
        comunidad: {
          select: {
            nombreComunidad: true,
            departamento: true,
            municipio: true
          }
        }
      }
    })

    return NextResponse.json(nuevaEntrevista, { status: 201 })
  } catch (error) {
    console.error('Error al crear entrevista:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
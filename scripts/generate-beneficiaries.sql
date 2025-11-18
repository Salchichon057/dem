-- Script para insertar 400 beneficiarios aleatorios en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Primero, necesitamos un user_id válido para created_by
-- Reemplaza 'YOUR_USER_ID_HERE' con un UUID de un usuario existente en tu tabla users
-- O ejecuta esto primero para obtener un usuario: SELECT id FROM users LIMIT 1;

DO $$
DECLARE
  v_created_by uuid := (SELECT id FROM users LIMIT 1); -- Toma el primer usuario disponible
  v_departments text[] := ARRAY[
    'Guatemala', 'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula',
    'El Progreso', 'Escuintla', 'Huehuetenango', 'Izabal', 'Jalapa',
    'Jutiapa', 'Petén', 'Quetzaltenango', 'Quiché', 'Retalhuleu',
    'Sacatepéquez', 'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez',
    'Totonicapán', 'Zacapa'
  ];
  
  v_municipalities jsonb := '{
    "Guatemala": ["Guatemala", "Mixco", "Villa Nueva", "San Juan Sacatepéquez", "Villa Canales", "Amatitlán", "Chinautla", "San Miguel Petapa"],
    "Alta Verapaz": ["Cobán", "San Pedro Carchá", "San Cristóbal Verapaz", "Tactic", "Tamahú", "Tucurú", "Panzós", "Senahú"],
    "Baja Verapaz": ["Salamá", "Rabinal", "San Miguel Chicaj", "Cubulco", "Granados", "Santa Cruz el Chol", "San Jerónimo", "Purulhá"],
    "Chimaltenango": ["Chimaltenango", "San José Poaquil", "San Martín Jilotepeque", "Comalapa", "Santa Apolonia", "Tecpán", "Patzún", "Pochuta"],
    "Chiquimula": ["Chiquimula", "San José la Arada", "San Juan Ermita", "Jocotán", "Camotán", "Olopa", "Esquipulas", "Concepción Las Minas"],
    "El Progreso": ["Guastatoya", "Morazán", "San Agustín Acasaguastlán", "San Cristóbal Acasaguastlán", "El Jícaro", "Sansare", "Sanarate", "San Antonio La Paz"],
    "Escuintla": ["Escuintla", "Santa Lucía Cotzumalguapa", "La Democracia", "Siquinalá", "Masagua", "Tiquisate", "La Gomera", "Guanagazapa"],
    "Huehuetenango": ["Huehuetenango", "Chiantla", "Malacatancito", "Cuilco", "Nentón", "San Pedro Necta", "Jacaltenango", "Soloma"],
    "Izabal": ["Puerto Barrios", "Livingston", "El Estor", "Morales", "Los Amates"],
    "Jalapa": ["Jalapa", "San Pedro Pinula", "San Luis Jilotepeque", "San Manuel Chaparrón", "San Carlos Alzatate", "Monjas", "Mataquescuintla"],
    "Jutiapa": ["Jutiapa", "El Progreso", "Santa Catarina Mita", "Agua Blanca", "Asunción Mita", "Yupiltepeque", "Atescatempa", "Jerez"],
    "Petén": ["Flores", "San Benito", "San Andrés", "La Libertad", "San Francisco", "Santa Ana", "Dolores", "Poptún"],
    "Quetzaltenango": ["Quetzaltenango", "Salcajá", "Olintepeque", "San Carlos Sija", "Sibilia", "Cabricán", "Cajolá", "San Miguel Sigüilá"],
    "Quiché": ["Santa Cruz del Quiché", "Chiché", "Chinique", "Zacualpa", "Chajul", "Chichicastenango", "Patzité", "San Antonio Ilotenango"],
    "Retalhuleu": ["Retalhuleu", "San Sebastián", "Santa Cruz Muluá", "San Martín Zapotitlán", "San Felipe", "San Andrés Villa Seca"],
    "Sacatepéquez": ["Antigua Guatemala", "Jocotenango", "Pastores", "Sumpango", "Santo Domingo Xenacoj", "Santiago Sacatepéquez", "San Bartolomé Milpas Altas", "San Lucas Sacatepéquez"],
    "San Marcos": ["San Marcos", "San Pedro Sacatepéquez", "San Antonio Sacatepéquez", "Comitancillo", "San Miguel Ixtahuacán", "Concepción Tutuapa", "Tacaná", "Sibinal"],
    "Santa Rosa": ["Cuilapa", "Barberena", "Santa Rosa de Lima", "Casillas", "San Rafael las Flores", "Oriente", "San Juan Tecuaco", "Chiquimulilla"],
    "Sololá": ["Sololá", "San José Chacayá", "Santa María Visitación", "Santa Lucía Utatlán", "Nahualá", "Santa Catarina Ixtahuacán", "Santa Clara la Laguna", "Concepción"],
    "Suchitepéquez": ["Mazatenango", "Cuyotenango", "San Francisco Zapotitlán", "San Bernardino", "San José El Ídolo", "Santo Domingo Suchitepéquez", "San Lorenzo", "Samayac"],
    "Totonicapán": ["Totonicapán", "San Cristóbal Totonicapán", "San Francisco El Alto", "San Andrés Xecul", "Momostenango", "Santa María Chiquimula", "Santa Lucía La Reforma", "San Bartolo"],
    "Zacapa": ["Zacapa", "Estanzuela", "Río Hondo", "Gualán", "Teculután", "Usumatlán", "Cabañas", "San Diego"]
  }'::jsonb;
  
  v_programs text[] := ARRAY[
    'Programa de Educación',
    'Programa de Salud',
    'Programa de Nutrición',
    'Programa de Desarrollo Comunitario',
    'Programa de Vivienda',
    'Programa de Agricultura',
    'Programa de Microempresas',
    'Programa de Agua y Saneamiento'
  ];
  
  v_male_names text[] := ARRAY[
    'José', 'Juan', 'Carlos', 'Luis', 'Miguel', 'Pedro', 'Manuel', 'Jorge',
    'Fernando', 'Ricardo', 'Roberto', 'Francisco', 'Rafael', 'Ángel',
    'Antonio', 'Diego', 'Javier', 'Alejandro', 'Daniel', 'Raúl',
    'Mario', 'Sergio', 'Eduardo', 'Pablo', 'Víctor', 'Enrique'
  ];
  
  v_female_names text[] := ARRAY[
    'María', 'Ana', 'Carmen', 'Rosa', 'Lucía', 'Isabel', 'Teresa', 'Sofía',
    'Patricia', 'Laura', 'Marta', 'Elena', 'Claudia', 'Silvia', 'Gloria',
    'Beatriz', 'Gabriela', 'Verónica', 'Sandra', 'Mónica', 'Alejandra',
    'Diana', 'Andrea', 'Cristina', 'Mariana', 'Paola'
  ];
  
  v_last_names text[] := ARRAY[
    'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez',
    'Hernández', 'Ramírez', 'Torres', 'Flores', 'Morales', 'Jiménez',
    'Alvarez', 'Romero', 'Gutiérrez', 'Mendoza', 'Castillo', 'Ortiz',
    'Vargas', 'Reyes', 'Cruz', 'Moreno', 'Díaz', 'Aguilar', 'Santos',
    'Mejía', 'Vásquez', 'Ramos', 'Medina', 'Soto'
  ];
  
  v_villages text[] := ARRAY[
    'Aldea Central', 'El Rosario', 'San Antonio', 'Las Flores', 'El Carmen',
    'Santa Elena', 'Los Pinos', 'La Esperanza', 'San José', 'El Mirador',
    'Las Palmas', 'Vista Hermosa', 'San Miguel', 'La Reforma', 'El Progreso',
    'Santa Cruz', 'Los Olivos', 'La Libertad', 'San Pedro', 'El Paraíso'
  ];
  
  v_name text;
  v_gender text;
  v_age integer;
  v_department text;
  v_municipality text;
  v_village text;
  v_program text;
  v_admission_date date;
  v_is_active boolean;
  v_dpi text;
  i integer;
  
BEGIN
  -- Verificar que existe al menos un usuario
  IF v_created_by IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios en la tabla users. Crea al menos un usuario primero.';
  END IF;
  
  -- Insertar 400 beneficiarios
  FOR i IN 1..400 LOOP
    -- Género aleatorio
    v_gender := CASE WHEN random() < 0.5 THEN 'Masculino' ELSE 'Femenino' END;
    
    -- Nombre aleatorio según género
    IF v_gender = 'Masculino' THEN
      v_name := v_male_names[1 + floor(random() * array_length(v_male_names, 1))::int] || ' ' ||
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int] || ' ' ||
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int];
    ELSE
      v_name := v_female_names[1 + floor(random() * array_length(v_female_names, 1))::int] || ' ' ||
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int] || ' ' ||
                v_last_names[1 + floor(random() * array_length(v_last_names, 1))::int];
    END IF;
    
    -- Edad aleatoria entre 5 y 85
    v_age := 5 + floor(random() * 80)::int;
    
    -- Departamento aleatorio
    v_department := v_departments[1 + floor(random() * array_length(v_departments, 1))::int];
    
    -- Municipio aleatorio del departamento seleccionado
    v_municipality := (v_municipalities->v_department->>floor(random() * jsonb_array_length(v_municipalities->v_department))::int);
    
    -- Aldea aleatoria
    v_village := v_villages[1 + floor(random() * array_length(v_villages, 1))::int];
    
    -- Programa aleatorio
    v_program := v_programs[1 + floor(random() * array_length(v_programs, 1))::int];
    
    -- Fecha de admisión aleatoria en los últimos 3 años
    v_admission_date := CURRENT_DATE - (floor(random() * 1095)::int || ' days')::interval;
    
    -- 90% activos, 10% inactivos
    v_is_active := random() < 0.9;
    
    -- DPI aleatorio (13 dígitos) - 70% tienen DPI, 30% no
    IF random() < 0.7 THEN
      v_dpi := lpad(floor(random() * 10000000000000)::bigint::text, 13, '0');
    ELSE
      v_dpi := NULL;
    END IF;
    
    -- Insertar beneficiario
    INSERT INTO public.beneficiaries (
      name,
      age,
      gender,
      dpi,
      program,
      admission_date,
      is_active,
      department,
      municipality,
      village,
      address,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      v_name,
      v_age,
      v_gender,
      v_dpi,
      v_program,
      v_admission_date,
      v_is_active,
      v_department,
      v_municipality,
      v_village,
      'Calle Principal, Zona ' || (1 + floor(random() * 15)::int),
      v_created_by,
      NOW() - (floor(random() * 30)::int || ' days')::interval,
      NOW() - (floor(random() * 7)::int || ' days')::interval
    );
    
    -- Mostrar progreso cada 50 registros
    IF i % 50 = 0 THEN
      RAISE NOTICE 'Insertados % beneficiarios...', i;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✓ Se insertaron exitosamente 400 beneficiarios aleatorios';
END $$;

-- Verificar la inserción
SELECT 
  COUNT(*) as total_beneficiarios,
  COUNT(CASE WHEN is_active THEN 1 END) as activos,
  COUNT(CASE WHEN NOT is_active THEN 1 END) as inactivos,
  COUNT(CASE WHEN gender = 'Masculino' THEN 1 END) as masculino,
  COUNT(CASE WHEN gender = 'Femenino' THEN 1 END) as femenino
FROM public.beneficiaries;

-- Ver distribución por departamento
SELECT 
  department,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM beneficiaries), 2) as porcentaje
FROM public.beneficiaries
GROUP BY department
ORDER BY cantidad DESC;

-- Ver distribución por programa
SELECT 
  program,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM beneficiaries), 2) as porcentaje
FROM public.beneficiaries
GROUP BY program
ORDER BY cantidad DESC;

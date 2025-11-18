/**
 * Script para verificar los buckets de Supabase Storage
 * Ejecutar con: node --env-file=.env.local -r esbuild-register scripts/setup-storage-buckets.ts
 * O simplemente: npx tsx --env-file=.env.local scripts/setup-storage-buckets.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables de entorno:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Buckets que necesitamos según STORAGE_BUCKETS en lib/storage/handler.ts
const REQUIRED_BUCKETS = [
  {
    name: 'beneficiaries-photos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'form-abrazando-leyendas',
    public: true,
    allowedMimeTypes: null, // Acepta todos los tipos
    fileSizeLimit: 10485760 // 10MB
  },
  {
    name: 'form-comunidades',
    public: true,
    allowedMimeTypes: null,
    fileSizeLimit: 10485760
  },
  {
    name: 'form-auditorias',
    public: true,
    allowedMimeTypes: null,
    fileSizeLimit: 10485760
  },
  {
    name: 'form-organizaciones',
    public: true,
    allowedMimeTypes: null,
    fileSizeLimit: 10485760
  },
  {
    name: 'form-perfil-comunitario',
    public: true,
    allowedMimeTypes: null,
    fileSizeLimit: 10485760
  },
  {
    name: 'form-voluntariado',
    public: true,
    allowedMimeTypes: null,
    fileSizeLimit: 10485760
  }
]

async function setupBuckets() {
  console.log('🔍 Verificando buckets de Supabase Storage...\n')
  console.log(`📡 URL: ${SUPABASE_URL}`)
  console.log(`🔑 Usando: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}`)
  console.log()

  // Obtener lista de buckets existentes
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('❌ Error al listar buckets:', listError.message)
    console.log('\n⚠️  Nota: Para crear buckets necesitas la SUPABASE_SERVICE_ROLE_KEY')
    console.log('    Puedes obtenerla en: https://supabase.com/dashboard/project/rslboufatgzicrvmrbnu/settings/api')
    return
  }

  const existingBucketNames = existingBuckets?.map(b => b.name) || []
  console.log('📦 Buckets existentes:', existingBucketNames.join(', ') || 'ninguno')
  console.log()

  // Verificar y crear cada bucket necesario
  let bucketsToCreate = 0
  for (const bucket of REQUIRED_BUCKETS) {
    if (existingBucketNames.includes(bucket.name)) {
      console.log(`✅ Bucket "${bucket.name}" ya existe`)
    } else {
      console.log(`❌ Bucket "${bucket.name}" NO existe`)
      bucketsToCreate++
      
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log(`⏳ Creando bucket "${bucket.name}"...`)
        
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes
        })

        if (error) {
          console.error(`❌ Error al crear bucket "${bucket.name}":`, error.message)
        } else {
          console.log(`✅ Bucket "${bucket.name}" creado exitosamente`)
        }
      }
    }
  }

  if (bucketsToCreate > 0 && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`\n⚠️  Faltan ${bucketsToCreate} buckets por crear`)
    console.log('    Para crearlos automáticamente, agrega SUPABASE_SERVICE_ROLE_KEY en .env.local')
    console.log('    O créalos manualmente en: https://supabase.com/dashboard/project/rslboufatgzicrvmrbnu/storage/buckets')
  } else {
    console.log('\n✨ Configuración de buckets completada!')
  }
}

setupBuckets().catch(console.error)

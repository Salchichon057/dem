/**
 * Script para verificar los buckets de Supabase Storage
 * Ejecutar con: node --env-file=.env.local -r esbuild-register scripts/setup-storage-buckets.ts
 * O simplemente: npx tsx --env-file=.env.local scripts/setup-storage-buckets.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
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
  // Obtener lista de buckets existentes
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    return
  }

  const existingBucketNames = existingBuckets?.map(b => b.name) || []
  
  // Verificar y crear cada bucket necesario
  let bucketsToCreate = 0
  for (const bucket of REQUIRED_BUCKETS) {
    if (existingBucketNames.includes(bucket.name)) {
    } else {
      bucketsToCreate++
      
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes
        })

        if (error) {
        } else {
        }
      }
    }
  }

  if (bucketsToCreate > 0 && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  } else {
  }
}

setupBuckets().catch(console.error)


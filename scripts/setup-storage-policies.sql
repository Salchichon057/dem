-- ============================================
-- Políticas de Storage para Buckets en Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================
-- NOTA: Este script debe ejecutarse como servicio (service_role)
-- Si falla, es porque necesitas ejecutarlo desde la UI de Storage Policies
-- ============================================

-- ============================================
-- OPCIÓN 1: Usar BEGIN...EXCEPTION (maneja errores de permisos)
-- ============================================
DO $$
DECLARE
  bucket_names TEXT[] := ARRAY[
    'beneficiaries-photos',
    'form-abrazando-leyendas',
    'form-comunidades',
    'form-auditorias',
    'form-organizaciones',
    'form-perfil-comunitario',
    'form-voluntariado'
  ];
  bucket TEXT;
  policy_exists BOOLEAN;
BEGIN
  FOREACH bucket IN ARRAY bucket_names
  LOOP
    -- Eliminar políticas existentes (ignorar si no existen o no hay permisos)
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow authenticated uploads to ' || bucket);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo eliminar política de uploads para %: %', bucket, SQLERRM;
    END;

    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow public reads from ' || bucket);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo eliminar política de reads para %: %', bucket, SQLERRM;
    END;

    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow authenticated updates to ' || bucket);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo eliminar política de updates para %: %', bucket, SQLERRM;
    END;

    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Allow authenticated deletes from ' || bucket);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo eliminar política de deletes para %: %', bucket, SQLERRM;
    END;

    -- Crear políticas nuevas
    BEGIN
      EXECUTE format($sql$
        CREATE POLICY %I
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = %L)
      $sql$, 
      'Allow authenticated uploads to ' || bucket,
      bucket
      );
      RAISE NOTICE '✓ Política INSERT creada para: %', bucket;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '✗ No se pudo crear política INSERT para %: %', bucket, SQLERRM;
    END;

    BEGIN
      EXECUTE format($sql$
        CREATE POLICY %I
        ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id = %L)
      $sql$,
      'Allow public reads from ' || bucket,
      bucket
      );
      RAISE NOTICE '✓ Política SELECT creada para: %', bucket;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '✗ No se pudo crear política SELECT para %: %', bucket, SQLERRM;
    END;

    BEGIN
      EXECUTE format($sql$
        CREATE POLICY %I
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = %L)
        WITH CHECK (bucket_id = %L)
      $sql$,
      'Allow authenticated updates to ' || bucket,
      bucket,
      bucket
      );
      RAISE NOTICE '✓ Política UPDATE creada para: %', bucket;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '✗ No se pudo crear política UPDATE para %: %', bucket, SQLERRM;
    END;

    BEGIN
      EXECUTE format($sql$
        CREATE POLICY %I
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = %L)
      $sql$,
      'Allow authenticated deletes from ' || bucket,
      bucket
      );
      RAISE NOTICE '✓ Política DELETE creada para: %', bucket;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '✗ No se pudo crear política DELETE para %: %', bucket, SQLERRM;
    END;

  END LOOP;
  
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Proceso completado';
  RAISE NOTICE '==========================================';
END $$;

-- ============================================
-- VERIFICAR POLÍTICAS CREADAS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%beneficiaries%'
     OR policyname LIKE '%form-%')
ORDER BY policyname;

-- ============================================
-- SI EL SCRIPT ANTERIOR FALLA POR PERMISOS,
-- USA ESTE ENFOQUE ALTERNATIVO (desde la UI):
-- ============================================
-- Ve a: Storage > Configuration > Policies
-- https://supabase.com/dashboard/project/rslboufatgzicrvmrbnu/storage/policies
-- 
-- Para cada bucket, usa el botón "New Policy" y estos templates:
--
-- Template 1: "Allow authenticated uploads"
-- Template 2: "Allow public access to a bucket"
-- 
-- Esto creará automáticamente las políticas correctas.


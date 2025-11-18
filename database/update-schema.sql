-- ============================================
-- DASHBOARD ONG - ACTUALIZACIÓN DE SCHEMA
-- Agregar solo beneficiaries y volunteers
-- Las tablas users, roles ya existen
-- ============================================

-- ============================================
-- NOTA: NO ejecutar DROP en producción
-- Este script solo AGREGA las tablas faltantes
-- ============================================

-- Habilitar extensiones necesarias (si no están ya)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- VERIFICAR QUE EXISTAN roles y users
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'roles') THEN
    RAISE EXCEPTION 'La tabla roles no existe. Por favor, verificar la base de datos.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    RAISE EXCEPTION 'La tabla users no existe. Por favor, verificar la base de datos.';
  END IF;
END $$;

-- ============================================
-- TABLA: beneficiaries (YA EXISTE - Solo verificar)
-- ============================================
-- La tabla beneficiaries ya existe según el schema proporcionado
-- Solo verificamos que tenga las columnas necesarias

-- Agregar columnas faltantes si no existen (safe operation)
DO $$
BEGIN
  -- Verificar si la columna 'notes' no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'notes'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN notes TEXT;
  END IF;

  -- Verificar si la columna 'enrollment_date' no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'enrollment_date'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN enrollment_date DATE;
  END IF;
END $$;

-- ============================================
-- TABLA: volunteers (YA EXISTE - Solo verificar)
-- ============================================
-- La tabla volunteers ya existe según el schema proporcionado
-- Verificar estructura

-- ============================================
-- FUNCIÓN: handle_new_user()
-- Sincroniza usuarios de auth.users con la tabla users
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Obtener el ID del rol 'viewer' por defecto
  SELECT id INTO default_role_id FROM roles WHERE name = 'viewer' LIMIT 1;
  
  -- Si no existe rol viewer, usar el primer rol disponible
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id FROM roles LIMIT 1;
  END IF;
  
  -- Insertar en la tabla users solo si no existe
  INSERT INTO public.users (id, email, name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    default_role_id
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: on_auth_user_created
-- Se ejecuta cuando se crea un usuario en auth.users
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCIÓN: update_updated_at()
-- Actualiza automáticamente el campo updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS: update_updated_at
-- Actualizar timestamp en UPDATE
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_beneficiaries_updated_at ON beneficiaries;
CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_volunteers_updated_at ON volunteers;
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en las tablas (si no está ya habilitado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON users;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON users;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver beneficiarios activos" ON beneficiaries;
DROP POLICY IF EXISTS "Editors y Admins pueden crear beneficiarios" ON beneficiaries;
DROP POLICY IF EXISTS "Editors y Admins pueden actualizar beneficiarios" ON beneficiaries;
DROP POLICY IF EXISTS "Solo Admins pueden eliminar beneficiarios" ON beneficiaries;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver voluntarios activos" ON volunteers;
DROP POLICY IF EXISTS "Editors y Admins pueden crear voluntarios" ON volunteers;
DROP POLICY IF EXISTS "Editors y Admins pueden actualizar voluntarios" ON volunteers;
DROP POLICY IF EXISTS "Solo Admins pueden eliminar voluntarios" ON volunteers;

-- Políticas para users
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los usuarios"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Políticas para beneficiaries
CREATE POLICY "Usuarios autenticados pueden ver beneficiarios activos"
  ON beneficiaries FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Editors y Admins pueden crear beneficiarios"
  ON beneficiaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors y Admins pueden actualizar beneficiarios"
  ON beneficiaries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'editor')
    )
  );

CREATE POLICY "Solo Admins pueden eliminar beneficiarios"
  ON beneficiaries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Políticas para volunteers (mismas que beneficiaries)
CREATE POLICY "Usuarios autenticados pueden ver voluntarios activos"
  ON volunteers FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Editors y Admins pueden crear voluntarios"
  ON volunteers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editors y Admins pueden actualizar voluntarios"
  ON volunteers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'editor')
    )
  );

CREATE POLICY "Solo Admins pueden eliminar voluntarios"
  ON volunteers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de usuarios con nombre de rol
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
  u.id,
  u.email,
  u.name,
  r.name as role_name,
  r.permissions,
  u.is_active,
  u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id;

-- Vista de estadísticas de beneficiarios
CREATE OR REPLACE VIEW beneficiaries_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true AND deleted_at IS NULL) as active,
  COUNT(*) FILTER (WHERE gender = 'Masculino') as male,
  COUNT(*) FILTER (WHERE gender = 'Femenino') as female,
  COUNT(DISTINCT department) as total_departments,
  COUNT(DISTINCT program) as total_programs
FROM beneficiaries
WHERE deleted_at IS NULL;

-- Vista de estadísticas de voluntarios
CREATE OR REPLACE VIEW volunteers_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true AND deleted_at IS NULL) as active,
  SUM(total_hours) as total_hours,
  COUNT(*) FILTER (WHERE receives_benefit = true) as with_benefits,
  COUNT(DISTINCT volunteer_type) as total_types,
  COUNT(DISTINCT organization) FILTER (WHERE organization IS NOT NULL) as total_organizations
FROM volunteers
WHERE deleted_at IS NULL;

COMMENT ON VIEW users_with_roles IS 'Usuarios con información de roles y permisos';
COMMENT ON VIEW beneficiaries_stats IS 'Estadísticas generales de beneficiarios';
COMMENT ON VIEW volunteers_stats IS 'Estadísticas generales de voluntarios';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que el usuario admin existe
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM users WHERE email = 'admin@demforms.com'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE 'Usuario admin@demforms.com encontrado correctamente';
  ELSE
    RAISE WARNING 'Usuario admin@demforms.com NO encontrado. Verificar autenticación.';
  END IF;
END $$;

-- Mostrar resumen de roles
SELECT 
  r.name as role_name,
  COUNT(u.id) as user_count
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

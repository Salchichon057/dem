-- ============================================
-- Setup Inicial de Roles y Auth Sync
-- Dashboard ONG - Supabase Auth Integration
-- ============================================
-- 
-- Este script configura:
-- 1. Rol por defecto para usuarios
-- 2. Trigger para sincronizar auth.users → public.users
-- 3. Función para manejar nuevos usuarios
--
-- EJECUTAR EN: Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREAR ROLES (MANTENER TUS ROLES EXISTENTES)
-- ============================================
-- Insertar rol 'viewer' si no existe
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'viewer',
  'Visualizador',
  '{
    "forms": {
      "read": true,
      "create": false,
      "delete": false,
      "update": false
    },
    "users": {
      "manage": false
    },
    "submissions": {
      "delete": false,
      "export": false,
      "view_all": false
    }
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Insertar rol 'editor' si no existe
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'editor',
  'Editor de formularios',
  '{
    "forms": {
      "read": true,
      "create": true,
      "delete": false,
      "update": true
    },
    "users": {
      "manage": false
    },
    "submissions": {
      "delete": false,
      "export": true,
      "view_all": true
    }
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Insertar rol 'admin' si no existe
INSERT INTO public.roles (name, description, permissions)
VALUES (
  'admin',
  'Administrador del sistema',
  '{
    "forms": {
      "read": true,
      "create": true,
      "delete": true,
      "update": true
    },
    "users": {
      "manage": true
    },
    "submissions": {
      "delete": true,
      "export": true,
      "view_all": true
    }
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. FUNCIÓN PARA MANEJAR NUEVOS USUARIOS
-- ============================================
-- Esta función se ejecuta cuando un usuario se registra en auth.users
-- Crea automáticamente el registro correspondiente en public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Obtener el ID del rol 'viewer' por defecto (menor privilegio)
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE name = 'viewer'
  LIMIT 1;

  -- Si no existe el rol, lanzar error
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el rol por defecto "viewer". Ejecuta primero la creación de roles.';
  END IF;

  -- Insertar usuario en public.users
  INSERT INTO public.users (
    id,
    email,
    name,
    role_id,
    avatar_url,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), -- Extraer nombre del metadata o email
    default_role_id,
    NEW.raw_user_meta_data->>'avatar_url', -- Avatar del metadata si existe
    true,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ============================================
-- 3. CREAR TRIGGER EN auth.users
-- ============================================
-- Este trigger se ejecuta DESPUÉS de insertar un usuario en auth.users
-- Llama a la función handle_new_user() para crear el registro en public.users

-- Eliminar trigger si existe (para re-crear)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. VERIFICACIÓN
-- ============================================
-- Verificar que los roles existen
SELECT 
  id,
  name,
  description,
  created_at
FROM public.roles
ORDER BY name;

-- Verificar que el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- 5. NOTAS IMPORTANTES
-- ============================================
-- 
-- ✅ FLUJO DE REGISTRO:
-- 1. Frontend: supabase.auth.signUp({ email, password, options: { data: { name } } })
-- 2. Supabase crea usuario en auth.users
-- 3. Trigger on_auth_user_created se ejecuta automáticamente
-- 4. Función handle_new_user() crea registro en public.users con rol 'user'
-- 5. Usuario queda sincronizado en ambas tablas
--
-- ✅ METADATA PERSONALIZADA:
-- Para pasar datos adicionales en el registro (nombre, avatar, etc.):
-- supabase.auth.signUp({
--   email: 'user@example.com',
--   password: 'password',
--   options: {
--     data: {
--       name: 'John Doe',
--       avatar_url: 'https://...'
--     }
--   }
-- })
--
-- ✅ SINCRONIZACIÓN:
-- - auth.users.id === public.users.id (mismo UUID)
-- - auth.users.email === public.users.email
-- - auth.users.raw_user_meta_data->>'name' → public.users.name
--
-- ⚠️ PERMISOS:
-- - La función handle_new_user() se ejecuta con SECURITY DEFINER
-- - Esto significa que tiene permisos de superusuario para insertar en public.users
-- - Es seguro porque el trigger solo se ejecuta en INSERT de auth.users (controlado por Supabase)
--
-- ============================================

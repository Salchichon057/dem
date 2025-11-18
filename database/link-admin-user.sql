-- ============================================
-- VINCULAR USUARIO ADMIN CON SUPABASE AUTH
-- ============================================

-- Usuario existente en la base de datos:
-- ID: 4157e293-5629-4369-bcdb-5a0197596e3c
-- Email: admin@demforms.com
-- Role: admin (f221d6c4-883f-4e70-b9aa-5d0b93493b27)

-- ============================================
-- PASO 1: Verificar datos del usuario
-- ============================================

SELECT 
  u.id,
  u.email,
  u.name,
  r.name as role_name,
  u.is_active,
  u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@demforms.com';

-- Resultado esperado:
-- id: 4157e293-5629-4369-bcdb-5a0197596e3c
-- email: admin@demforms.com
-- name: Admin DEM Forms
-- role_name: admin
-- is_active: true

-- ============================================
-- PASO 2: CREAR USUARIO EN SUPABASE AUTH
-- ============================================

-- IMPORTANTE: Este paso se hace en Supabase Dashboard
-- 1. Ir a: https://supabase.com/dashboard/project/rslboufatgzicrvmrbnu
-- 2. Click en "Authentication" > "Users"
-- 3. Click en "Add User" (+)
-- 4. Usar EXACTAMENTE estos datos:
--
--    Email: admin@demforms.com
--    Password: AdminDEM2024!
--    User UID: 4157e293-5629-4369-bcdb-5a0197596e3c
--    ✓ Auto Confirm User (IMPORTANTE: marcar esta opción)
--
-- 5. Click en "Create User"

-- ALTERNATIVA: Si no puedes especificar el UUID, crea el usuario normalmente
-- y luego ejecuta el PASO 3

-- ============================================
-- PASO 3: SINCRONIZAR IDS (Solo si creaste usuario sin UUID específico)
-- ============================================

-- Si creaste un usuario en Auth con un UUID diferente, ejecuta esto:
-- (Reemplaza 'NUEVO-UUID-DE-AUTH' con el UUID que se generó)

-- UPDATE users
-- SET id = 'NUEVO-UUID-DE-AUTH'::uuid
-- WHERE email = 'admin@demforms.com';

-- ============================================
-- PASO 4: Verificar sincronización
-- ============================================

-- Verificar en auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@demforms.com';

-- Verificar en public.users
SELECT 
  u.id,
  u.email,
  u.name,
  r.name as role_name
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@demforms.com';

-- Los UUIDs deben coincidir!

-- ============================================
-- PASO 5: Verificar que el trigger funciona para nuevos usuarios
-- ============================================

-- El trigger handle_new_user() debe estar activo
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- CREDENCIALES DE LOGIN
-- ============================================

/*
Una vez completados los pasos, usa estas credenciales en la app:

Email: admin@demforms.com
Password: AdminDEM2024!

URL de login: http://localhost:3001/login
*/

# Estructura de Base de Datos - Dashboard ONG

## 📊 Resumen de Tablas

Tu base de datos en Supabase tiene **3 tipos** de entidades:

### 1️⃣ **Datos Directos** (Tablas independientes)
Estas tablas almacenan datos directamente, no mediante formularios:

- ✅ **`volunteers`** - Registro directo de voluntarios
- ✅ **`beneficiaries`** - Registro directo de beneficiarios (Abrazando Leyendas)

### 2️⃣ **Sistema de Formularios Dinámicos**
Estas entidades NO tienen tablas propias, se manejan mediante el sistema de formularios:

- 📋 **Comunidades** → Usa `communities_submissions` + `communities_answers`
- 📋 **Voluntariado (formularios)** → Usa `volunteer_submissions` + `volunteer_answers`
- 📋 **Abrazando Leyendas (formularios)** → Usa `embracing_legends_submissions` + `embracing_legends_answers`
- 📋 **Organizaciones** → Usa `organizations_submissions` + `organizations_answers`
- 📋 **Auditorías** → Usa `audits_submissions` + `audits_answers`
- 📋 **Perfil Comunitario** → Usa `community_profile_submissions` + `community_profile_answers`

### 3️⃣ **Infraestructura del Sistema**
- `form_templates` - Plantillas de formularios
- `form_sections` - Secciones de formularios
- `questions` - Preguntas de formularios
- `question_types` - Tipos de preguntas disponibles
- `form_submissions` - Tabla genérica de submissions (menos usada)
- `submission_answers` - Respuestas genéricas
- `form_assignments` - Asignación de formularios a usuarios
- `users` - Usuarios del sistema (manejados por Supabase Auth)
- `roles` - Roles y permisos
- `audit_log` - Registro de auditoría

---

## 🎯 ¿Cómo funciona cada sección?

### **Voluntarios** 
**Tabla directa:** `volunteers`

```typescript
// API: /api/volunteers
// Campos principales:
{
  name, volunteer_type, organization, shift,
  entry_time, exit_time, total_hours,
  department, municipality, village,
  work_date, is_active, ...
}
```

**Uso:** CRUD completo desde el componente `admin-voluntarios-section.tsx`

---

### **Beneficiarios (Abrazando Leyendas)**
**Tabla directa:** `beneficiaries`

```typescript
// API: /api/beneficiaries
// Campos principales:
{
  name, age, gender, dpi, program,
  admission_date, department, municipality,
  village, photo_url, is_active, ...
}
```

**Uso:** CRUD completo desde el componente `abrazando-leyendas-section.tsx`

---

### **Comunidades**
**Sistema de formularios:** `communities_submissions` + `communities_answers`

**NO hay tabla "comunidades"** - Los datos se almacenan mediante:

1. Crear formulario con `section_location = 'comunidades'`
2. Las respuestas se guardan en:
   - `communities_submissions` (una fila por formulario enviado)
   - `communities_answers` (una fila por cada respuesta a pregunta)

```typescript
// Flujo:
1. Crear formulario: POST /api/formularios
   { 
     name: "Registro de Comunidad X",
     section_location: "comunidades",
     sections: [...]
   }

2. Enviar respuestas: POST /api/submissions
   {
     form_template_id: "uuid",
     answers: [{ question_id, answer_value }, ...]
   }

3. El sistema automáticamente guarda en:
   - communities_submissions (submission)
   - communities_answers (respuestas)
```

**Uso:** 
- Crear formularios: `formularios-section.tsx` con filtro `section_location=comunidades`
- Ver submissions: Componente personalizado que consulta `communities_submissions`

---

### **Voluntariado (Formularios)**
**Sistema de formularios:** `volunteer_submissions` + `volunteer_answers`

Similar a comunidades, pero con `section_location = 'voluntariado'`

**NOTA:** Hay dos formas de manejar voluntariado:
1. **Datos directos** → Tabla `volunteers` (para registro operativo)
2. **Formularios** → `volunteer_submissions` (para encuestas/evaluaciones)

---

### **Abrazando Leyendas (Formularios)**
**Sistema de formularios:** `embracing_legends_submissions` + `embracing_legends_answers`

Similar a comunidades, con `section_location = 'abrazando-leyendas'`

**NOTA:** Hay dos formas aquí también:
1. **Datos directos** → Tabla `beneficiaries` (para registro de beneficiarios)
2. **Formularios** → `embracing_legends_submissions` (para evaluaciones/seguimiento)

---

## 📁 Estructura del Mapper

El archivo `lib/types.ts` tiene el mapper que conecta `section_location` con las tablas:

```typescript
export const SUBMISSION_TABLES_MAP = {
  'organizaciones': {
    submissions: 'organizations_submissions',
    answers: 'organizations_answers'
  },
  'auditorias': {
    submissions: 'audits_submissions',
    answers: 'audits_answers'
  },
  'perfil-comunitario': {
    submissions: 'community_profile_submissions',
    answers: 'community_profile_answers'
  },
  'voluntariado': {
    submissions: 'volunteer_submissions',
    answers: 'volunteer_answers'
  },
  'comunidades': {
    submissions: 'communities_submissions',
    answers: 'communities_answers'
  },
  'abrazando-leyendas': {
    submissions: 'embracing_legends_submissions',
    answers: 'embracing_legends_answers'
  }
}
```

---

## ✅ APIs Activas

### Datos Directos
- ✅ `GET/POST /api/volunteers` - CRUD de voluntarios
- ✅ `GET/PUT/DELETE /api/volunteers/[id]` - Operaciones individuales
- ✅ `GET /api/volunteers/stats` - Estadísticas
- ✅ `GET/POST /api/beneficiaries` - CRUD de beneficiarios
- ✅ `GET/PUT/DELETE /api/beneficiaries/[id]` - Operaciones individuales
- ✅ `GET /api/beneficiaries/stats` - Estadísticas

### Sistema de Formularios
- ✅ `GET/POST /api/formularios` - CRUD de formularios
- ✅ `GET/PUT/DELETE /api/formularios/[id]` - Operaciones individuales
- ✅ `POST /api/submissions` - Enviar respuestas (automáticamente va a la tabla correcta)
- ✅ `GET /api/submissions?form_template_id=X` - Obtener respuestas
- ✅ `GET /api/question-types` - Tipos de preguntas disponibles

---

## 🚀 Cómo implementar "Lista de Comunidades"

Para mostrar una lista de comunidades, tienes dos opciones:

### Opción 1: Crear tabla independiente `communities`
```sql
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  department varchar NOT NULL,
  municipality varchar NOT NULL,
  village varchar,
  leader_name varchar,
  leader_phone varchar,
  -- ... más campos
  created_at timestamptz DEFAULT now()
);
```

### Opción 2: Usar el sistema de formularios (Recomendado)
1. Crear un formulario "Registro de Comunidad"
2. Las submissions quedan en `communities_submissions`
3. Crear API para listar:

```typescript
// app/api/communities-list/route.ts
export async function GET() {
  const { data } = await supabase
    .from('communities_submissions')
    .select(`
      id,
      submitted_at,
      form_template_id,
      form_templates (
        name
      )
    `)
  
  return NextResponse.json(data)
}
```

---

## 📝 Resumen

- **Volunteers y Beneficiaries**: ✅ Ya funcionan con tablas directas
- **Comunidades, Auditorías, etc.**: ✅ Usan sistema de formularios dinámicos
- **No hay data dummy**: Todo limpio y alineado con Supabase
- **Auth**: ✅ Migrado a Supabase Auth (sin Prisma)

# Sistema de Submissions por Section Location

## Resumen

Este sistema distribuye las submissions en diferentes tablas según el `section_location` de cada formulario, utilizando un **enum** y un **mapper** para evitar código duplicado.

## Estructura

### 1. Enum `FormSectionType`

Define todos los tipos de secciones disponibles:

```typescript
export enum FormSectionType {
  PERFIL_COMUNITARIO = 'perfil-comunitario',
  ORGANIZACIONES = 'organizaciones',
  AUDITORIAS = 'auditorias',
  COMUNIDADES = 'comunidades',
  VOLUNTARIADO = 'voluntariado',
  ABRAZANDO_LEYENDAS = 'abrazando-leyendas'
}
```

### 2. Mapper `SUBMISSION_TABLES_MAP`

Mapea cada `section_location` a sus tablas correspondientes:

```typescript
export const SUBMISSION_TABLES_MAP = {
  [FormSectionType.ORGANIZACIONES]: {
    submissions: 'organizations_submissions',
    answers: 'organizations_answers'
  },
  [FormSectionType.AUDITORIAS]: {
    submissions: 'audits_submissions',
    answers: 'audits_answers'
  },
  // ... otros mappings
}
```

## Tablas en Base de Datos

Cada `section_location` tiene 2 tablas:

### Submissions (ejemplo: `organizations_submissions`)
- `id` - UUID
- `form_template_id` - FK a form_templates
- `user_id` - FK a users
- `submitted_at` - timestamp
- `updated_at` - timestamp

### Answers (ejemplo: `organizations_answers`)
- `id` - UUID
- `submission_id` - FK a *_submissions
- `question_id` - FK a questions
- `answer_value` - JSONB con las respuestas
- `created_at` - timestamp

## Helper: `lib/supabase/submissions.ts`

Proporciona funciones reutilizables para todas las operaciones:

### Funciones Principales

```typescript
// Crear una submission
const submission = await createSubmission(
  FormSectionType.ORGANIZACIONES,
  {
    form_template_id: 'uuid',
    user_id: 'uuid'
  }
)

// Crear respuestas
const answers = await createAnswers(
  FormSectionType.ORGANIZACIONES,
  [{ submission_id, question_id, answer_value }]
)

// Obtener submissions de un formulario
const submissions = await getSubmissionsByFormId(
  FormSectionType.ORGANIZACIONES,
  'form-template-uuid'
)

// Contar submissions
const count = await countSubmissionsByFormId(
  FormSectionType.ORGANIZACIONES,
  'form-template-uuid'
)

// Contar para múltiples formularios (retorna Record<formId, count>)
const counts = await countSubmissionsByFormIds(
  FormSectionType.ORGANIZACIONES,
  ['uuid1', 'uuid2']
)

// Obtener conteos para todos los formularios (auto-detecta section_location)
const allCounts = await getAllSubmissionsCounts(['uuid1', 'uuid2', 'uuid3'])
```

## Uso en API Endpoints

### Ejemplo: Crear Submission

```typescript
// app/api/submissions/route.ts
export async function POST(request: NextRequest) {
  const { form_template_id, user_id, answers } = await request.json()
  
  // 1. Obtener section_location del formulario
  const { data: form } = await supabase
    .from('form_templates')
    .select('section_location')
    .eq('id', form_template_id)
    .single()
  
  const sectionLocation = form.section_location as FormSectionType
  
  // 2. Crear submission en la tabla correcta
  const submission = await createSubmission(sectionLocation, {
    form_template_id,
    user_id
  })
  
  // 3. Crear respuestas en la tabla correcta
  const createdAnswers = await createAnswers(sectionLocation, answers)
  
  return NextResponse.json({ submission, answers: createdAnswers })
}
```

### Ejemplo: Obtener Submissions

```typescript
export async function GET(request: NextRequest) {
  const formTemplateId = searchParams.get('form_template_id')
  
  // 1. Obtener section_location
  const { data: form } = await supabase
    .from('form_templates')
    .select('section_location')
    .eq('id', formTemplateId)
    .single()
  
  const sectionLocation = form.section_location as FormSectionType
  
  // 2. Obtener submissions de la tabla correcta
  const submissions = await getSubmissionsByFormId(sectionLocation, formTemplateId)
  
  return NextResponse.json({ submissions })
}
```

## Ventajas de este Sistema

1. **Sin Código Duplicado**: Una sola función maneja todas las secciones
2. **Type-Safe**: TypeScript valida los enum values
3. **Escalable**: Agregar nueva sección = agregar entrada al enum y mapper
4. **Performance**: Queries optimizadas por tabla específica
5. **Mantenible**: Lógica centralizada en el helper

## Migración desde Tablas Antiguas

Ver: `prisma/migration-split-submissions-by-section.sql`

1. Ejecutar script de migración SQL
2. Verificar datos con queries de verificación
3. Actualizar código para usar nuevo helper
4. Mantener tablas antiguas como backup (30 días)

## Agregar Nueva Sección

```typescript
// 1. Agregar al enum
export enum FormSectionType {
  // ... existentes
  NUEVA_SECCION = 'nueva-seccion'
}

// 2. Agregar al mapper
export const SUBMISSION_TABLES_MAP = {
  // ... existentes
  [FormSectionType.NUEVA_SECCION]: {
    submissions: 'nueva_seccion_submissions',
    answers: 'nueva_seccion_answers'
  }
}

// 3. Crear tablas en BD (ver migration script como referencia)
// 4. Listo! El helper funciona automáticamente
```

## Testing

```typescript
// Ejemplo de test
const testFormId = 'uuid-test'
const testSectionLocation = FormSectionType.ORGANIZACIONES

// Crear submission
const submission = await createSubmission(testSectionLocation, {
  form_template_id: testFormId,
  user_id: 'user-uuid'
})

expect(submission.id).toBeDefined()

// Verificar que se guardó en la tabla correcta
const { submissions: tableName } = getSubmissionTables(testSectionLocation)
expect(tableName).toBe('organizations_submissions')
```

## Notas Importantes

- Todos los formularios **DEBEN** tener `section_location` definido
- Los valores de `section_location` deben coincidir con los enum values
- Las tablas tienen ON DELETE CASCADE, eliminar submission borra sus answers
- Los indexes están optimizados para queries por form_template_id

## Archivos Modificados

- ✅ `lib/types.ts` - Enum y mapper
- ✅ `lib/supabase/submissions.ts` - Helper functions
- ✅ `app/api/formularios/route.ts` - Usa getAllSubmissionsCounts
- ✅ `app/api/submissions/route.ts` - Endpoint ejemplo
- ✅ `prisma/migration-split-submissions-by-section.sql` - Script de migración

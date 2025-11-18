# Sistema de Almacenamiento de Archivos

Sistema robusto y agnóstico de archivos para el Dashboard ONG, diseñado para facilitar migración entre diferentes proveedores de storage (Supabase, S3, Azure Blob).

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Nomenclatura de Archivos](#nomenclatura-de-archivos)
- [Buckets por Sección](#buckets-por-sección)
- [Uso del Hook useFileUpload](#uso-del-hook-usefileupload)
- [Migración a Otro Storage Provider](#migración-a-otro-storage-provider)
- [API y Funciones Helper](#api-y-funciones-helper)

---

## 🏗️ Arquitectura

### Paths Relativos vs URLs Completas

El sistema **NO guarda URLs completas** en la base de datos, sino **paths relativos puros**. Esto permite cambiar de proveedor de storage sin modificar los datos almacenados.

**Formato de Path Relativo:**
```
bucket-name/userId_resourceType_resourceId_timestamp_hash.ext
```

**Ejemplo:**
```
form-comunidades/abc123_submission_xyz789_1700000000000_a1b2c3.jpg
```

**¿Por qué paths relativos?**
- ✅ Migración fácil entre proveedores (Supabase → S3 → Azure Blob)
- ✅ Cambiar CDN sin afectar datos
- ✅ Desarrollo local vs producción con diferentes URLs
- ✅ Menor tamaño en base de datos

### Configuración en .env

```bash
# URL base del storage provider - Se puede cambiar para migrar
NEXT_PUBLIC_STORAGE_BASE_URL=https://rslboufatgzicrvmrbnu.supabase.co/storage/v1/object/public

# Para S3:
# NEXT_PUBLIC_STORAGE_BASE_URL=https://mi-bucket.s3.amazonaws.com

# Para Azure Blob:
# NEXT_PUBLIC_STORAGE_BASE_URL=https://mistorage.blob.core.windows.net
```

---

## 🏷️ Nomenclatura de Archivos

### Formato Único y Trazable

```
{userId}_{resourceType}_{resourceId}_{timestamp}_{randomHash}.{ext}
```

**Componentes:**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `userId` | ID del usuario que sube el archivo | `abc123` |
| `resourceType` | Tipo de recurso | `submission`, `beneficiary`, `volunteer`, `profile` |
| `resourceId` | ID del recurso específico | `xyz789` |
| `timestamp` | Timestamp en milisegundos | `1700000000000` |
| `randomHash` | Hash aleatorio de 6 caracteres | `a1b2c3` |
| `ext` | Extensión del archivo | `jpg`, `pdf`, `png` |

**Ejemplos Reales:**

```bash
# Foto de beneficiario
beneficiaries-photos/550e8400_beneficiary_e29b41d4_1732000000000_x7k9p2.jpg

# Archivo en formulario de comunidades
form-comunidades/550e8400_submission_a47f51e8_1732000000001_m3n8q5.pdf

# Foto en auditoría
form-auditorias/550e8400_submission_b58g62f9_1732000000002_r4s7t1.png
```

### Ventajas de Esta Nomenclatura

- ✅ **Única globalmente**: Timestamp + hash aleatorio evita colisiones
- ✅ **Trazable**: Sabes quién subió el archivo y cuándo
- ✅ **Organizada**: Agrupada por tipo de recurso
- ✅ **Auditable**: Puedes rastrear archivos a usuarios específicos

---

## 🗂️ Buckets por Sección

### Estructura de Buckets

```typescript
export const STORAGE_BUCKETS = {
  BENEFICIARIES: 'beneficiaries-photos',
  FORM_ABRAZANDO_LEYENDAS: 'form-abrazando-leyendas',
  FORM_COMUNIDADES: 'form-comunidades',
  FORM_AUDITORIAS: 'form-auditorias',
  FORM_ORGANIZACIONES: 'form-organizaciones',
  FORM_PERFIL_COMUNITARIO: 'form-perfil-comunitario',
  FORM_VOLUNTARIADO: 'form-voluntariado',
} as const
```

### Mapeo de Secciones a Buckets

| Sección del Formulario | Bucket | `section_location` | Uso |
|------------------------|--------|-------------------|-----|
| Abrazando Leyendas | `form-abrazando-leyendas` | `abrazando-leyendas` | Fotos/archivos de formularios Abrazando Leyendas |
| Comunidades | `form-comunidades` | `comunidades` | Documentos de comunidades |
| Auditorías | `form-auditorias` | `auditorias` | Archivos de auditorías sociales |
| Organizaciones | `form-organizaciones` | `organizaciones` | Documentos de organizaciones |
| Perfil Comunitario | `form-perfil-comunitario` | `perfil-comunitario` | Archivos de perfiles comunitarios |
| Voluntariado | `form-voluntariado` | `voluntariado` | Documentos de voluntariado |
| Beneficiarios | `beneficiaries-photos` | N/A | Fotos de beneficiarios (tabla directa) |

### Políticas de Storage

**Configuración Recomendada por Bucket:**

- **Public**: Todos los buckets son públicos (lectura)
- **Max Size**: 10MB para documentos, 5MB para imágenes
- **Tipos Permitidos**:
  - Imágenes: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Documentos: `application/pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`

---

## 🪝 Uso del Hook useFileUpload

### Importación

```typescript
import { useFileUpload } from '@/hooks/use-file-upload'
```

### Ejemplo Básico

```typescript
'use client'

import { useFileUpload } from '@/hooks/use-file-upload'

export function FormularioComunidades() {
  const {
    files,
    isUploading,
    addFiles,
    uploadFiles,
    removeFile,
    getSuccessfulUploads,
  } = useFileUpload({
    formSection: 'FORM_COMUNIDADES',
    submissionId: 'abc-123-xyz',
    maxFiles: 5,
    maxSizeMB: 10,
    onSuccess: (files) => {
      console.log('Archivos subidos:', files)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    // Subir archivos primero
    await uploadFiles()
    
    // Obtener paths de archivos exitosos
    const filePaths = getSuccessfulUploads()
    
    // Guardar paths en la base de datos
    // ... tu lógica de submit
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />
      
      {/* Lista de archivos */}
      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.file.name} - {file.status}
            {file.status === 'uploading' && ` (${file.progress}%)`}
            <button onClick={() => removeFile(file.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <button onClick={handleSubmit} disabled={isUploading}>
        {isUploading ? 'Subiendo...' : 'Enviar Formulario'}
      </button>
    </div>
  )
}
```

### Props del Hook

```typescript
interface UseFileUploadOptions {
  formSection: FormSection // Sección del formulario
  submissionId: string // ID del submission
  maxFiles?: number // Default: 5
  maxSizeMB?: number // Default: 10
  acceptedTypes?: string[] // Default: imágenes + PDF
  onSuccess?: (files: UploadedFile[]) => void
  onError?: (error: string) => void
}
```

### Valores Retornados

```typescript
{
  files: UploadedFile[] // Lista de archivos con estado
  isUploading: boolean // Si está subiendo
  addFiles: (files: File[]) => void // Agregar archivos
  uploadFiles: () => Promise<void> // Subir todos los pendientes
  removeFile: (id: string) => void // Eliminar un archivo
  clearFiles: () => void // Limpiar todos
  getSuccessfulUploads: () => string[] // Obtener paths de exitosos
}
```

---

## 🔄 Migración a Otro Storage Provider

### Paso 1: Cambiar la URL Base

Actualiza `.env.local`:

```bash
# Antes (Supabase)
NEXT_PUBLIC_STORAGE_BASE_URL=https://rslboufatgzicrvmrbnu.supabase.co/storage/v1/object/public

# Después (AWS S3)
NEXT_PUBLIC_STORAGE_BASE_URL=https://mi-bucket.s3.amazonaws.com

# O (Azure Blob Storage)
NEXT_PUBLIC_STORAGE_BASE_URL=https://mistorage.blob.core.windows.net
```

### Paso 2: Migrar Archivos Existentes

Script de ejemplo para migrar archivos:

```typescript
// scripts/migrate-storage.ts
import { createClient } from '@supabase/supabase-js'
import AWS from 'aws-sdk'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const s3 = new AWS.S3({ /* config */ })

async function migrateFiles() {
  // 1. Listar todos los archivos en Supabase
  const { data: files } = await supabase.storage
    .from('form-comunidades')
    .list()

  for (const file of files) {
    // 2. Descargar archivo de Supabase
    const { data: fileData } = await supabase.storage
      .from('form-comunidades')
      .download(file.name)

    // 3. Subir a S3 con el MISMO path relativo
    await s3.upload({
      Bucket: 'mi-bucket',
      Key: `form-comunidades/${file.name}`,
      Body: fileData,
    }).promise()

    console.log(`✅ Migrado: ${file.name}`)
  }
}
```

### Paso 3: Actualizar StorageHandler (si es necesario)

Si el nuevo proveedor requiere autenticación diferente, actualiza `lib/storage/handler.ts`:

```typescript
// Ejemplo para S3
import AWS from 'aws-sdk'

class StorageHandler {
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  })

  async uploadFile(...) {
    await this.s3.upload({
      Bucket: 'mi-bucket',
      Key: fileName,
      Body: file,
    }).promise()

    return fileName // Mismo path relativo
  }
}
```

**IMPORTANTE**: Los paths relativos guardados en la base de datos **NO cambian**. Solo cambia cómo se construye la URL pública.

---

## 🛠️ API y Funciones Helper

### Funciones Helper Disponibles

```typescript
import {
  uploadBeneficiaryPhoto,
  uploadFormFile,
  getFileUrl,
  deleteFile,
  replaceBeneficiaryPhoto,
  ensureAllBucketsExist,
} from '@/lib/storage/handler'
```

### `uploadBeneficiaryPhoto`

Sube una foto de beneficiario.

```typescript
const relativePath = await uploadBeneficiaryPhoto(
  file, // File object
  userId, // ID del usuario
  beneficiaryId // ID del beneficiario
)
// Returns: "beneficiaries-photos/userId_beneficiary_beneficiaryId_timestamp_hash.jpg"
```

### `uploadFormFile`

Sube un archivo en un formulario.

```typescript
const relativePath = await uploadFormFile(
  file, // File object
  'FORM_COMUNIDADES', // Sección del formulario
  userId, // ID del usuario
  submissionId // ID del submission
)
// Returns: "form-comunidades/userId_submission_submissionId_timestamp_hash.pdf"
```

### `getFileUrl`

Obtiene la URL pública completa desde un path relativo.

```typescript
const url = getFileUrl('form-comunidades/abc_submission_xyz_1700000000000_a1b2c3.jpg')
// Returns: "https://rslboufatgzicrvmrbnu.supabase.co/storage/v1/object/public/form-comunidades/abc_submission_xyz_1700000000000_a1b2c3.jpg"
```

### `deleteFile`

Elimina un archivo del storage.

```typescript
await deleteFile('form-comunidades/abc_submission_xyz_1700000000000_a1b2c3.jpg')
```

### `ensureAllBucketsExist`

Crea todos los buckets necesarios (útil en setup inicial).

```typescript
await ensureAllBucketsExist()
```

---

## 📊 Estructura en Base de Datos

### Guardar Paths en Respuestas de Formularios

Los paths relativos se guardan en `answer_value` como JSON:

```json
{
  "type": "file",
  "value": [
    "form-comunidades/550e8400_submission_a47f51e8_1732000000000_x7k9p2.jpg",
    "form-comunidades/550e8400_submission_a47f51e8_1732000000001_m3n8q5.pdf"
  ]
}
```

### Ejemplo de Inserción

```typescript
// Subir archivos
const filePaths = await uploadFiles() // ['bucket/file1.jpg', 'bucket/file2.pdf']

// Guardar en submission_answers
await supabase.from('communities_answers').insert({
  submission_id: submissionId,
  question_id: questionId,
  answer_value: {
    type: 'file',
    value: filePaths, // Paths relativos puros
  },
})
```

### Ejemplo de Lectura

```typescript
// Leer respuesta
const { data } = await supabase
  .from('communities_answers')
  .select('answer_value')
  .eq('id', answerId)
  .single()

// Convertir paths a URLs públicas
const files = data.answer_value.value.map(relativePath => ({
  path: relativePath,
  url: getFileUrl(relativePath),
}))
```

---

## ✅ Checklist de Implementación

Cuando agregues soporte para archivos en un nuevo tipo de formulario:

- [ ] Verifica que el bucket esté en `STORAGE_BUCKETS`
- [ ] Usa el hook `useFileUpload` con el `formSection` correcto
- [ ] Guarda los paths relativos en `answer_value.value` como array
- [ ] No guardes URLs completas en la base de datos
- [ ] Usa `getFileUrl()` para mostrar archivos en el frontend
- [ ] Implementa eliminación de archivos al eliminar respuestas
- [ ] Valida tipos y tamaños de archivo en el hook

---

## 🚀 Mejores Prácticas

1. **Siempre usa paths relativos** en la base de datos
2. **Genera URLs dinámicamente** con `getFileUrl()` al leer
3. **Valida archivos** antes de subirlos (tamaño, tipo)
4. **Limpia archivos huérfanos** cuando se eliminan submissions
5. **Usa el hook `useFileUpload`** para consistencia
6. **Testea con diferentes proveedores** cambiando `NEXT_PUBLIC_STORAGE_BASE_URL`
7. **Documenta nuevos buckets** si agregas secciones

---

## 🐛 Debugging

### Verificar que los buckets existen

```bash
# En Supabase Dashboard > Storage
# O vía código:
await ensureAllBucketsExist()
```

### Ver archivos en un bucket

```typescript
const { data } = await supabase.storage
  .from('form-comunidades')
  .list()

console.log(data)
```

### Verificar URL generada

```typescript
const path = 'form-comunidades/abc_submission_xyz_1700000000000_a1b2c3.jpg'
const url = getFileUrl(path)
console.log('URL generada:', url)
// Debería mostrar: https://...supabase.co/storage/v1/object/public/form-comunidades/...
```

---

## 📝 Notas Finales

- Los archivos se suben **antes** de guardar el submission
- Los paths se guardan en `answer_value` junto con otras respuestas
- El sistema es **completamente agnóstico** del proveedor de storage
- Migrar a S3/Azure Blob solo requiere cambiar `.env` y el método de upload en `StorageHandler`

**¿Preguntas?** Revisa `lib/storage/handler.ts` y `hooks/use-file-upload.ts` para más detalles.

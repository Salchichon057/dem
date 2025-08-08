-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."EstadoOrganizacion" AS ENUM ('ACTIVA', 'INACTIVA', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "public"."RolOrganizacion" AS ENUM ('ADMIN', 'EDITOR', 'MIEMBRO', 'INVITADO');

-- CreateEnum
CREATE TYPE "public"."EstadoFormulario" AS ENUM ('BORRADOR', 'PUBLICADO', 'CERRADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "public"."CategoriaPlantilla" AS ENUM ('GENERAL', 'EDUCACION', 'SALUD', 'EVENTOS', 'ENCUESTAS', 'CONTACTO', 'FEEDBACK', 'OTROS');

-- CreateEnum
CREATE TYPE "public"."TipoEstadistica" AS ENUM ('FORMULARIOS_CREADOS', 'RESPUESTAS_RECIBIDAS', 'USUARIOS_ACTIVOS', 'ORGANIZACIONES_NUEVAS', 'PLANTILLAS_UTILIZADAS', 'TASA_CONVERSION', 'TIEMPO_RESPUESTA');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizaciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "logo" TEXT,
    "estado" "public"."EstadoOrganizacion" NOT NULL DEFAULT 'ACTIVA',
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizacion_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "rol" "public"."RolOrganizacion" NOT NULL DEFAULT 'MIEMBRO',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizacion_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."formularios" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" JSONB NOT NULL,
    "estado" "public"."EstadoFormulario" NOT NULL DEFAULT 'BORRADOR',
    "fechaPublicacion" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "permiteMultiples" BOOLEAN NOT NULL DEFAULT true,
    "requiereLogin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadorId" TEXT NOT NULL,
    "organizacionId" TEXT,

    CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respuestas_formulario" (
    "id" TEXT NOT NULL,
    "formularioId" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "emailContacto" TEXT,
    "nombreContacto" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respuestas_formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plantillas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "contenido" JSONB NOT NULL,
    "categoria" "public"."CategoriaPlantilla" NOT NULL DEFAULT 'GENERAL',
    "esPublica" BOOLEAN NOT NULL DEFAULT false,
    "usoCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadorId" TEXT NOT NULL,
    "organizacionId" TEXT,
    "formularioId" TEXT,

    CONSTRAINT "plantillas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estadisticas" (
    "id" TEXT NOT NULL,
    "tipo" "public"."TipoEstadistica" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "metadatos" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "organizacionId" TEXT,

    CONSTRAINT "estadisticas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizacion_members_userId_organizacionId_key" ON "public"."organizacion_members"("userId", "organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_formularioId_key" ON "public"."plantillas"("formularioId");

-- AddForeignKey
ALTER TABLE "public"."organizacion_members" ADD CONSTRAINT "organizacion_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizacion_members" ADD CONSTRAINT "organizacion_members_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "public"."organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formularios" ADD CONSTRAINT "formularios_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formularios" ADD CONSTRAINT "formularios_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "public"."organizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuestas_formulario" ADD CONSTRAINT "respuestas_formulario_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "public"."formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plantillas" ADD CONSTRAINT "plantillas_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plantillas" ADD CONSTRAINT "plantillas_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "public"."organizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plantillas" ADD CONSTRAINT "plantillas_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "public"."formularios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estadisticas" ADD CONSTRAINT "estadisticas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estadisticas" ADD CONSTRAINT "estadisticas_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "public"."organizaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

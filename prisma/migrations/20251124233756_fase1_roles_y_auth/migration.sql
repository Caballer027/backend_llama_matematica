-- DropForeignKey
ALTER TABLE "public"."usuarios" DROP CONSTRAINT "usuarios_carrera_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."usuarios" DROP CONSTRAINT "usuarios_ciclo_actual_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."usuarios" DROP CONSTRAINT "usuarios_institucion_id_fkey";

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "hash_contrasena" DROP NOT NULL,
ALTER COLUMN "institucion_id" DROP NOT NULL,
ALTER COLUMN "carrera_id" DROP NOT NULL,
ALTER COLUMN "ciclo_actual_id" DROP NOT NULL,
ALTER COLUMN "ano_ingreso" DROP NOT NULL,
ALTER COLUMN "fecha_nacimiento" DROP NOT NULL;

-- CreateTable
CREATE TABLE "profesor_curso" (
    "usuario_id" BIGINT NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesor_curso_pkey" PRIMARY KEY ("usuario_id","curso_id")
);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "institucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_ciclo_actual_id_fkey" FOREIGN KEY ("ciclo_actual_id") REFERENCES "ciclo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesor_curso" ADD CONSTRAINT "profesor_curso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesor_curso" ADD CONSTRAINT "profesor_curso_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

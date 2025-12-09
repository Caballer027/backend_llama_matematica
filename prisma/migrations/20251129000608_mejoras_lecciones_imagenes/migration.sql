-- AlterEnum
ALTER TYPE "preguntas_tipo_pregunta" ADD VALUE 'seleccionar_imagen';

-- AlterTable
ALTER TABLE "lecciones" ADD COLUMN     "gemas" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "puntos_experiencia" INTEGER NOT NULL DEFAULT 100,
ALTER COLUMN "tiempo_limite_segundos" SET DEFAULT 1200;

-- AlterTable
ALTER TABLE "opciones_respuesta" ADD COLUMN     "url_imagen" VARCHAR(255),
ALTER COLUMN "texto_respuesta" DROP NOT NULL;

-- AlterTable
ALTER TABLE "preguntas" ADD COLUMN     "url_imagen_pregunta" VARCHAR(255),
ALTER COLUMN "puntos_otorgados" SET DEFAULT 5;

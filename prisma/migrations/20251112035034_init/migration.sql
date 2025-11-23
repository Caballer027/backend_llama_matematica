-- CreateEnum
CREATE TYPE "preguntas_tipo_pregunta" AS ENUM ('opcion_multiple', 'verdadero_falso', 'respuesta_abierta');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institucion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "dominio_correo" VARCHAR(100),

    CONSTRAINT "institucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrera" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "institucion_id" INTEGER NOT NULL,

    CONSTRAINT "carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciclo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "ciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrera_ciclo" (
    "carrera_id" INTEGER NOT NULL,
    "ciclo_id" INTEGER NOT NULL,

    CONSTRAINT "carrera_ciclo_pkey" PRIMARY KEY ("carrera_id","ciclo_id")
);

-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" SERIAL NOT NULL,
    "nombre_periodo" VARCHAR(20) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "institucion_id" INTEGER NOT NULL,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personajes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "asset_key" VARCHAR(50) NOT NULL,
    "url_imagen_base" VARCHAR(255),
    "mensaje_corta" VARCHAR(255),
    "mensaje_larga" TEXT,

    CONSTRAINT "personajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_item" (
    "id" SERIAL NOT NULL,
    "nombre_tipo" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "tipo_item_id" INTEGER NOT NULL,
    "nombre_item" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "costo_gemas" INTEGER NOT NULL DEFAULT 0,
    "url_icono_tienda" VARCHAR(255),
    "asset_index" INTEGER,
    "url_imagenes_equipado" JSONB,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(255) NOT NULL,
    "hash_contrasena" VARCHAR(255) NOT NULL,
    "institucion_id" INTEGER NOT NULL,
    "carrera_id" INTEGER NOT NULL,
    "ciclo_actual_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "ano_ingreso" INTEGER NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "periodo_actual_id" INTEGER,
    "puntos_experiencia" INTEGER NOT NULL DEFAULT 0,
    "gemas" INTEGER NOT NULL DEFAULT 0,
    "nombre_personaje_usuario" VARCHAR(100),
    "personaje_activo_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" SERIAL NOT NULL,
    "nombre_curso" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "ciclo_id" INTEGER NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temas" (
    "id" SERIAL NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "nombre_tema" VARCHAR(150) NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo_pregunta" VARCHAR(255),
    "historia_introduccion" TEXT,
    "historia_nudo" TEXT,
    "historia_desenlace" TEXT,
    "url_imagen_inicio" VARCHAR(255),
    "url_imagen_nudo" VARCHAR(255),
    "url_imagen_desenlace" VARCHAR(255),

    CONSTRAINT "temas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecciones" (
    "id" SERIAL NOT NULL,
    "tema_id" INTEGER NOT NULL,
    "titulo_leccion" VARCHAR(200) NOT NULL,
    "contenido_teorico" TEXT,
    "historia_introductoria" TEXT,
    "orden" INTEGER NOT NULL,
    "tiempo_limite_segundos" INTEGER,

    CONSTRAINT "lecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" SERIAL NOT NULL,
    "leccion_id" INTEGER NOT NULL,
    "enunciado_pregunta" TEXT NOT NULL,
    "puntos_otorgados" INTEGER NOT NULL DEFAULT 10,
    "tipo_pregunta" "preguntas_tipo_pregunta" NOT NULL,
    "respuesta_correcta_abierta" TEXT,
    "pasos_guia" JSONB,

    CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opciones_respuesta" (
    "id" SERIAL NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "texto_respuesta" VARCHAR(255) NOT NULL,
    "es_correcta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "opciones_respuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_usuario" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "opcion_seleccionada_id" INTEGER,
    "respuesta_abierta" TEXT,
    "es_correcta" BOOLEAN NOT NULL,
    "fecha_intento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acepto_guia" BOOLEAN NOT NULL DEFAULT false,
    "tiempo_restante" INTEGER,
    "xp_ganada" INTEGER NOT NULL DEFAULT 0,
    "quiz_session_id" BIGINT NOT NULL,

    CONSTRAINT "intentos_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_lecciones_usuario" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "leccion_id" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'no_iniciado',
    "puntaje_total" INTEGER,
    "xp_ganada" INTEGER NOT NULL DEFAULT 0,
    "gemas_ganadas" INTEGER NOT NULL DEFAULT 0,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progreso_lecciones_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_usuario" (
    "id" SERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "inventario_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo_usuario" (
    "id" SERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "tipo_item_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "equipo_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_session" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "leccion_id" INTEGER NOT NULL,
    "progreso_leccion_id" BIGINT NOT NULL,
    "tiempo_limite_segundos" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'en_progreso',
    "puntaje_obtenido" INTEGER NOT NULL DEFAULT 0,
    "xp_obtenida" INTEGER NOT NULL DEFAULT 0,
    "gemas_obtenidas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes_motivacionales" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "texto_mensaje" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_motivacionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_ia" (
    "id" BIGSERIAL NOT NULL,
    "progreso_leccion_id" BIGINT NOT NULL,
    "contenido_feedback" JSONB NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_ejercicio" (
    "id" BIGSERIAL NOT NULL,
    "feedback_id" BIGINT NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "detalle_json" JSONB NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_ejercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "institucion_nombre_key" ON "institucion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "carrera_nombre_key" ON "carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ciclo_nombre_key" ON "ciclo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_academicos_nombre_periodo_key" ON "periodos_academicos"("nombre_periodo");

-- CreateIndex
CREATE INDEX "periodos_academicos_institucion_id_idx" ON "periodos_academicos"("institucion_id");

-- CreateIndex
CREATE UNIQUE INDEX "personajes_asset_key_key" ON "personajes"("asset_key");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_item_nombre_tipo_key" ON "tipos_item"("nombre_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "items_nombre_item_key" ON "items"("nombre_item");

-- CreateIndex
CREATE UNIQUE INDEX "items_asset_index_key" ON "items"("asset_index");

-- CreateIndex
CREATE INDEX "items_tipo_item_id_idx" ON "items"("tipo_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuarios_carrera_id_idx" ON "usuarios"("carrera_id");

-- CreateIndex
CREATE INDEX "usuarios_ciclo_actual_id_idx" ON "usuarios"("ciclo_actual_id");

-- CreateIndex
CREATE INDEX "usuarios_institucion_id_idx" ON "usuarios"("institucion_id");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE INDEX "cursos_ciclo_id_idx" ON "cursos"("ciclo_id");

-- CreateIndex
CREATE UNIQUE INDEX "ciclo_id_nombre_curso_uq" ON "cursos"("ciclo_id", "nombre_curso");

-- CreateIndex
CREATE INDEX "temas_curso_id_idx" ON "temas"("curso_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_orden_tema_curso_unico" ON "temas"("curso_id", "orden");

-- CreateIndex
CREATE INDEX "lecciones_tema_id_idx" ON "lecciones"("tema_id");

-- CreateIndex
CREATE UNIQUE INDEX "tema_id_orden_uq" ON "lecciones"("tema_id", "orden");

-- CreateIndex
CREATE INDEX "preguntas_leccion_id_idx" ON "preguntas"("leccion_id");

-- CreateIndex
CREATE INDEX "opciones_respuesta_pregunta_id_idx" ON "opciones_respuesta"("pregunta_id");

-- CreateIndex
CREATE INDEX "intentos_usuario_usuario_id_idx" ON "intentos_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "intentos_usuario_pregunta_id_idx" ON "intentos_usuario"("pregunta_id");

-- CreateIndex
CREATE INDEX "intentos_usuario_opcion_seleccionada_id_idx" ON "intentos_usuario"("opcion_seleccionada_id");

-- CreateIndex
CREATE INDEX "intentos_usuario_quiz_session_id_idx" ON "intentos_usuario"("quiz_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_progreso_unico" ON "progreso_lecciones_usuario"("usuario_id", "leccion_id");

-- CreateIndex
CREATE INDEX "inventario_usuario_item_id_idx" ON "inventario_usuario"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_usuario_usuario_id_item_id_key" ON "inventario_usuario"("usuario_id", "item_id");

-- CreateIndex
CREATE INDEX "equipo_usuario_item_id_idx" ON "equipo_usuario"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipo_usuario_usuario_id_tipo_item_id_key" ON "equipo_usuario"("usuario_id", "tipo_item_id");

-- CreateIndex
CREATE INDEX "quiz_session_usuario_id_idx" ON "quiz_session"("usuario_id");

-- CreateIndex
CREATE INDEX "quiz_session_leccion_id_idx" ON "quiz_session"("leccion_id");

-- CreateIndex
CREATE INDEX "quiz_session_progreso_leccion_id_idx" ON "quiz_session"("progreso_leccion_id");

-- CreateIndex
CREATE UNIQUE INDEX "mensajes_motivacionales_texto_mensaje_key" ON "mensajes_motivacionales"("texto_mensaje");

-- CreateIndex
CREATE INDEX "mensajes_motivacionales_tipo_idx" ON "mensajes_motivacionales"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_ia_progreso_leccion_id_key" ON "feedback_ia"("progreso_leccion_id");

-- CreateIndex
CREATE INDEX "error_ejercicio_feedback_id_idx" ON "error_ejercicio"("feedback_id");

-- CreateIndex
CREATE INDEX "error_ejercicio_pregunta_id_idx" ON "error_ejercicio"("pregunta_id");

-- AddForeignKey
ALTER TABLE "carrera" ADD CONSTRAINT "carrera_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrera_ciclo" ADD CONSTRAINT "carrera_ciclo_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrera_ciclo" ADD CONSTRAINT "carrera_ciclo_ciclo_id_fkey" FOREIGN KEY ("ciclo_id") REFERENCES "ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_academicos" ADD CONSTRAINT "periodos_academicos_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_tipo_item_id_fkey" FOREIGN KEY ("tipo_item_id") REFERENCES "tipos_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_institucion_id_fkey" FOREIGN KEY ("institucion_id") REFERENCES "institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_ciclo_actual_id_fkey" FOREIGN KEY ("ciclo_actual_id") REFERENCES "ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_personaje_activo_id_fkey" FOREIGN KEY ("personaje_activo_id") REFERENCES "personajes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_periodo_actual_id_fkey" FOREIGN KEY ("periodo_actual_id") REFERENCES "periodos_academicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_ciclo_id_fkey" FOREIGN KEY ("ciclo_id") REFERENCES "ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temas" ADD CONSTRAINT "temas_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "temas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preguntas" ADD CONSTRAINT "preguntas_leccion_id_fkey" FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opciones_respuesta" ADD CONSTRAINT "opciones_respuesta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "preguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_usuario" ADD CONSTRAINT "intentos_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_usuario" ADD CONSTRAINT "intentos_usuario_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "preguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_usuario" ADD CONSTRAINT "intentos_usuario_opcion_seleccionada_id_fkey" FOREIGN KEY ("opcion_seleccionada_id") REFERENCES "opciones_respuesta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_usuario" ADD CONSTRAINT "intentos_usuario_quiz_session_id_fkey" FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_lecciones_usuario" ADD CONSTRAINT "progreso_lecciones_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_lecciones_usuario" ADD CONSTRAINT "progreso_lecciones_usuario_leccion_id_fkey" FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_usuario" ADD CONSTRAINT "inventario_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_usuario" ADD CONSTRAINT "inventario_usuario_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_usuario" ADD CONSTRAINT "equipo_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_usuario" ADD CONSTRAINT "equipo_usuario_tipo_item_id_fkey" FOREIGN KEY ("tipo_item_id") REFERENCES "tipos_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_usuario" ADD CONSTRAINT "equipo_usuario_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_leccion_id_fkey" FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_progreso_leccion_id_fkey" FOREIGN KEY ("progreso_leccion_id") REFERENCES "progreso_lecciones_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_ia" ADD CONSTRAINT "feedback_ia_progreso_leccion_id_fkey" FOREIGN KEY ("progreso_leccion_id") REFERENCES "progreso_lecciones_usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_ejercicio" ADD CONSTRAINT "error_ejercicio_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback_ia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_ejercicio" ADD CONSTRAINT "error_ejercicio_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "preguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

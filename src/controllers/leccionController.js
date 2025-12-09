// src/controllers/leccionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// =====================================================================================
// 🔒 AUXILIAR: Validar Suma de Puntos (Regla de Oro: máximo 20/20 por Lección)
// =====================================================================================
const validarSumaPuntos = async (leccionId, puntosNuevos, preguntaIdIgnorar = null) => {
  const preguntas = await prisma.preguntas.findMany({
    where: { leccion_id: Number(leccionId) },
    select: { id: true, puntos_otorgados: true }
  });

  let suma = 0;
  for (const p of preguntas) {
    if (preguntaIdIgnorar && p.id === Number(preguntaIdIgnorar)) continue;
    suma += p.puntos_otorgados;
  }

  const total = suma + Number(puntosNuevos);

  if (total > 20) {
    throw new Error(`La suma total sería ${total}/20. Disponibles: ${20 - suma}`);
  }
};

// =====================================================================================
// Helper robusto para parsear booleans
// =====================================================================================
const parseBoolStrict = (v) => {
  if (v === true || v === false) return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 't', 'yes', 'y', 'on'].includes(s)) return true;
    if (['0', 'false', 'f', 'no', 'n', 'off'].includes(s)) return false;
  }
  return false;
};

// =====================================================================================
// Normalizar opciones
// =====================================================================================
const normalizeOption = (op) => {
  const texto = op.texto ?? op.text ?? null;
  const url_imagen = op.url_imagen ?? op.url ?? null;

  const rawCorrect =
    op.es_correcta ??
    op.esCorrecta ??
    op.es_correct ??
    op.correct ??
    op.is_correct ??
    op.isCorrect ??
    op.correcta ??
    op.correcto ??
    null;

  const es_correcta = parseBoolStrict(rawCorrect);

  return {
    texto_respuesta: texto,
    url_imagen: url_imagen,
    es_correcta
  };
};

// =====================================================================================
// 1. GET Lección por ID
// =====================================================================================
exports.getLeccionById = async (req, res) => {
  const { id } = req.params;
  const esAdminOProfe = req.usuario?.rol === 1 || req.usuario?.rol === 2;

  try {
    const leccion = await prisma.lecciones.findUnique({
      where: { id: Number(id) },
      include: {
        preguntas: {
          orderBy: { id: 'asc' },
          include: {
            opciones_respuesta: {
              select: {
                id: true,
                texto_respuesta: true,
                url_imagen: true,
                es_correcta: esAdminOProfe ? true : false
              }
            }
          }
        }
      }
    });

    if (!leccion) return res.status(404).json({ error: 'Lección no encontrada.' });

    res.json(leccion);
  } catch (error) {
    console.error('❌ Error al obtener la lección:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
};

// =====================================================================================
// 2. GET Ranking
// =====================================================================================
exports.getRankingByLeccion = async (req, res) => {
  const leccionId = Number(req.params.id);

  try {
    const ranking = await prisma.progreso_lecciones_usuario.findMany({
      where: { leccion_id: leccionId },
      orderBy: { puntaje_total: 'desc' },
      take: 10,
      select: {
        puntaje_total: true,
        usuarios: { select: { nombre: true, apellido: true } }
      }
    });

    const result = ranking.map((r, index) => ({
      puesto: index + 1,
      nombre: r.usuarios?.nombre || 'Desconocido',
      apellido: r.usuarios?.apellido || '',
      puntos: r.puntaje_total || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Error ranking:', error);
    res.status(500).json({ error: 'Error al obtener ranking.' });
  }
};

// =====================================================================================
// 3. CREATE Lección
// =====================================================================================
exports.createLeccion = async (req, res) => {
  const { tema_id, titulo_leccion, contenido_teorico, orden, tiempo_limite_segundos, gemas, puntos_experiencia } = req.body;

  if (!tema_id || !titulo_leccion || !orden) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    const nuevaLeccion = await prisma.lecciones.create({
      data: {
        tema_id: Number(tema_id),
        titulo_leccion,
        contenido_teorico,
        orden: Number(orden),
        tiempo_limite_segundos: Number(tiempo_limite_segundos || 1200),
        gemas: Number(gemas || 50),
        puntos_experiencia: Number(puntos_experiencia || 100)
      }
    });

    res.status(201).json(nuevaLeccion);
  } catch (error) {
    console.error('❌ Error al crear lección:', error);
    res.status(500).json({ error: 'Error al crear la lección.' });
  }
};

// =====================================================================================
// 4. UPDATE Lección
// =====================================================================================
exports.updateLeccion = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const actualizada = await prisma.lecciones.update({
      where: { id: Number(id) },
      data: {
        titulo_leccion: data.titulo_leccion,
        contenido_teorico: data.contenido_teorico,
        orden: data.orden ? Number(data.orden) : undefined,
        tiempo_limite_segundos: data.tiempo_limite_segundos ? Number(data.tiempo_limite_segundos) : undefined,
        gemas: data.gemas ? Number(data.gemas) : undefined,
        puntos_experiencia: data.puntos_experiencia ? Number(data.puntos_experiencia) : undefined
      }
    });

    res.json(actualizada);
  } catch (error) {
    console.error('❌ Error al actualizar lección:', error);
    res.status(500).json({ error: 'Error al actualizar lección.' });
  }
};

// =====================================================================================
// 5. DELETE Lección
// =====================================================================================
exports.deleteLeccion = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.lecciones.delete({ where: { id: Number(id) } });
    res.json({ message: 'Lección eliminada.' });
  } catch (error) {
    console.error('❌ Error al eliminar lección:', error);
    res.status(500).json({ error: 'Error al eliminar (¿tiene preguntas asociadas?).' });
  }
};

// =====================================================================================
// 6. CREATE Pregunta
// =====================================================================================
exports.createPregunta = async (req, res) => {
  const leccionId = Number(req.params.id);
  const { enunciado, tipo, puntos, opciones, pasos_guia, url_imagen_pregunta } = req.body;

  console.log('DEBUG createPregunta -> req.body:', JSON.stringify(req.body, null, 2));

  if (!enunciado || !tipo) {
    return res.status(400).json({ error: 'Faltan datos de la pregunta.' });
  }

  try {
    await validarSumaPuntos(leccionId, puntos);

    const opcionesParaCrear = opciones?.length
      ? opciones.map(op => normalizeOption(op))
      : undefined;

    const nuevaPregunta = await prisma.preguntas.create({
      data: {
        leccion_id: leccionId,
        enunciado_pregunta: enunciado,
        tipo_pregunta: tipo,
        puntos_otorgados: Number(puntos),
        pasos_guia: pasos_guia || {},
        url_imagen_pregunta: url_imagen_pregunta || null,
        opciones_respuesta: opcionesParaCrear
          ? { create: opcionesParaCrear }
          : undefined
      },
      include: { opciones_respuesta: true }
    });

    res.status(201).json(nuevaPregunta);
  } catch (error) {
    console.error('❌ Error crear pregunta:', error);

    if (error.message && error.message.includes('/20'))
      return res.status(400).json({ error: error.message });

    res.status(500).json({ error: 'Error al crear la pregunta.' });
  }
};

// =====================================================================================
// 7. UPDATE Pregunta – Validación + Imágenes + Respuesta Abierta
// =====================================================================================
exports.updatePregunta = async (req, res) => {
  const { preguntaId } = req.params;
  
  // 🔥 CORRECCIÓN 1: Extraer 'respuesta_correcta_abierta'
  const { enunciado, tipo, puntos, opciones, pasos_guia, url_imagen_pregunta, respuesta_correcta_abierta } = req.body;

  console.log('DEBUG updatePregunta -> req.body:', JSON.stringify(req.body, null, 2));

  try {
    const actual = await prisma.preguntas.findUnique({
      where: { id: Number(preguntaId) }
    });

    if (!actual) return res.status(404).json({ error: 'La pregunta no existe.' });

    // Validar puntos
    await validarSumaPuntos(actual.leccion_id, puntos, preguntaId);

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar la pregunta
      await tx.preguntas.update({
        where: { id: Number(preguntaId) },
        data: {
          enunciado_pregunta: enunciado,
          tipo_pregunta: tipo,
          puntos_otorgados: Number(puntos),
          pasos_guia: pasos_guia || {},
          url_imagen_pregunta: url_imagen_pregunta || null,

          // 🔥 CORRECCIÓN 2
          respuesta_correcta_abierta: respuesta_correcta_abierta || null
        }
      });

      // 2. Opciones
      if (opciones) {
        const opcionesNormalizadas = opciones.map(op => normalizeOption(op));

        await tx.opciones_respuesta.deleteMany({
          where: { pregunta_id: Number(preguntaId) }
        });

        for (const op of opcionesNormalizadas) {
          await tx.opciones_respuesta.create({
            data: {
              pregunta_id: Number(preguntaId),
              texto_respuesta: op.texto_respuesta,
              url_imagen: op.url_imagen,
              es_correcta: op.es_correcta
            }
          });
        }
      }
    });

    res.json({ message: 'Pregunta actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error actualizar pregunta:', error);

    if (error.message && error.message.includes('/20'))
      return res.status(400).json({ error: error.message });

    res.status(500).json({ error: 'Error al actualizar la pregunta.' });
  }
};

// =====================================================================================
// 8. DELETE Pregunta
// =====================================================================================
exports.deletePregunta = async (req, res) => {
  const { preguntaId } = req.params;

  try {
    await prisma.preguntas.delete({
      where: { id: Number(preguntaId) }
    });

    res.json({ message: 'Pregunta eliminada correctamente.' });
  } catch (error) {
    console.error('❌ Error al eliminar pregunta:', error);
    res.status(500).json({ error: 'Error al eliminar pregunta.' });
  }
};

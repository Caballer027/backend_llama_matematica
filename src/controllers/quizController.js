const prisma = require('../prismaClient');
const iaService = require('../services/iaService');

/**
 * Normaliza una respuesta de texto para una comparación flexible.
 */
function normalizeRespuesta(texto) {
  if (typeof texto !== 'string') return '';
  return texto.trim().toLowerCase().replace(',', '.');
}

/**
 * Oculta la información sensible de una pregunta antes de enviarla al cliente.
 */
function limpiarPreguntaParaCliente(pregunta) {
  if (!pregunta) return null;
  return {
    id: pregunta.id,
    enunciado_pregunta: pregunta.enunciado_pregunta,
    tipo_pregunta: pregunta.tipo_pregunta,
    pasos_guia: pregunta.pasos_guia,
    opciones_respuesta: pregunta.opciones_respuesta?.map(op => ({
      id: op.id,
      texto_respuesta: op.texto_respuesta,
    })),
  };
}

// ============================================================
// POST /api/quiz/start
// ============================================================
exports.startQuizSession = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id);
  const { leccionId } = req.body;

  try {
    const leccion = await prisma.lecciones.findUnique({
      where: { id: Number(leccionId) },
      include: {
        preguntas: {
          orderBy: { id: 'asc' },
          include: { opciones_respuesta: true }
        }
      }
    });

    if (!leccion || leccion.preguntas.length === 0) {
      return res.status(404).json({ error: 'Lección o preguntas no encontradas.' });
    }

    const sesionActiva = await prisma.quiz_session.findFirst({
      where: {
        usuario_id: usuarioId,
        leccion_id: Number(leccionId),
        expires_at: { gt: new Date() }
      }
    });

    if (sesionActiva) {
      return res.status(400).json({
        message: 'Ya tienes una sesión activa para esta lección.',
        sessionId: sesionActiva.id.toString()
      });
    }

    const progreso = await prisma.progreso_lecciones_usuario.upsert({
      where: {
        usuario_id_leccion_id: { usuario_id: usuarioId, leccion_id: Number(leccionId) }
      },
      update: {
        estado: 'en_progreso',
        intentos: { increment: 1 }
      },
      create: {
        usuario_id: usuarioId,
        leccion_id: Number(leccionId),
        estado: 'en_progreso',
        intentos: 1
      }
    });

    const tiempoLimite = leccion.tiempo_limite_segundos || 1200;
    const expires_at = new Date(Date.now() + tiempoLimite * 1000);

    const nuevaSesion = await prisma.quiz_session.create({
      data: {
        usuario_id: usuarioId,
        leccion_id: Number(leccionId),
        progreso_leccion_id: progreso.id,
        tiempo_limite_segundos: tiempoLimite,
        expires_at: expires_at,
      }
    });

    res.status(201).json({
      sessionId: nuevaSesion.id.toString(),
      leccionTitulo: leccion.titulo_leccion,
      expires_at: nuevaSesion.expires_at,
      totalPreguntas: leccion.preguntas.length,
      primeraPregunta: limpiarPreguntaParaCliente(leccion.preguntas[0])
    });

  } catch (error) {
    console.error('❌ Error al iniciar el quiz:', error);
    res.status(500).json({ error: 'Error al iniciar la sesión de quiz.' });
  }
};

// ============================================================
// POST /api/quiz/:sessionId/answer
// ============================================================
exports.submitAnswer = async (req, res) => {
  const { sessionId } = req.params;
  const usuarioId = BigInt(req.usuario.id);
  const { preguntaId, respuestaAbierta, opcionId, acepto_guia, tiempo_restante } = req.body;

  try {
    const sesion = await prisma.quiz_session.findUnique({
      where: { id: BigInt(sessionId), usuario_id: usuarioId },
      include: { leccion: { include: { preguntas: { orderBy: { id: 'asc' } } } } }
    });

    if (!sesion) {
      return res.status(404).json({ error: 'Sesión de quiz no encontrada.' });
    }

    if (new Date() > sesion.expires_at) {
      return res.status(403).json({ error: 'El tiempo para este quiz ha expirado.' });
    }

    const pregunta = await prisma.preguntas.findUnique({
      where: { id: Number(preguntaId) },
      include: { opciones_respuesta: { where: { es_correcta: true } } }
    });

    if (!pregunta || pregunta.leccion_id !== sesion.leccion_id) {
      return res.status(403).json({ error: 'Pregunta no válida para esta sesión.' });
    }

    let esCorrecta = false;
    if (pregunta.tipo_pregunta === 'opcion_multiple') {
      const respuestaCorrecta = pregunta.opciones_respuesta[0];
      if (respuestaCorrecta && Number(opcionId) === respuestaCorrecta.id) {
        esCorrecta = true;
      }
    } else if (pregunta.tipo_pregunta === 'respuesta_abierta') {
      if (normalizeRespuesta(respuestaAbierta) === normalizeRespuesta(pregunta.respuesta_correcta_abierta)) {
        esCorrecta = true;
      }
    }

    let xpGanada = 0;
    if (esCorrecta) {
      const xpBase = pregunta.puntos_otorgados || 10;
      const tiempoLimite = sesion.tiempo_limite_segundos;
      const timeBonusRatio = Math.floor((tiempo_restante / tiempoLimite) * xpBase * 0.2);
      xpGanada = Math.round(xpBase + timeBonusRatio);
    }

    await prisma.intentos_usuario.create({
      data: {
        usuario_id: usuarioId,
        pregunta_id: Number(preguntaId),
        quiz_session_id: BigInt(sessionId),
        opcion_seleccionada_id: opcionId ? Number(opcionId) : null,
        respuesta_abierta: respuestaAbierta,
        es_correcta: esCorrecta,
        acepto_guia: acepto_guia || false,
        tiempo_restante: tiempo_restante,
        xp_ganada: xpGanada
      }
    });

    const preguntasLeccion = sesion.leccion.preguntas;
    const indiceActual = preguntasLeccion.findIndex(p => p.id === Number(preguntaId));
    const proximaPregunta = (indiceActual + 1 < preguntasLeccion.length)
      ? preguntasLeccion[indiceActual + 1]
      : null;

    res.json({
      es_correcta: esCorrecta,
      xp_ganada: xpGanada,
      siguientePregunta: limpiarPreguntaParaCliente(proximaPregunta),
      mensaje: proximaPregunta ? "Respuesta guardada." : "Has respondido la última pregunta. ¡Termina el quiz!"
    });

  } catch (error) {
    console.error('❌ Error al enviar respuesta:', error);
    res.status(500).json({ error: 'Error al procesar la respuesta.' });
  }
};

// ============================================================
// POST /api/quiz/:sessionId/finish
// ============================================================
exports.finishQuizSession = async (req, res) => {
  const { sessionId } = req.params;
  const usuarioId = BigInt(req.usuario.id);
  const PENALIZACION_POR_GUIA = 2;

  try {
    const sesion = await prisma.quiz_session.findUnique({
      where: { id: BigInt(sessionId), usuario_id: usuarioId },
      include: {
        intentos: {
          include: { preguntas: true }
        }
      }
    });

    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada.' });
    }

    // ============================================================
    // 1. OBTENER CONFIGURACIÓN DE LA LECCIÓN (Gemas y XP Base)
    // ============================================================
    const leccionData = await prisma.lecciones.findUnique({
      where: { id: sesion.leccion_id },
      select: { gemas: true, puntos_experiencia: true }
    });

    const BASE_GEMAS = leccionData.gemas || 50;
    const BASE_XP = leccionData.puntos_experiencia || 100;

    // ============================================================
    // 2. Calcular totales del intento
    // ============================================================
    let xp_total_intento = 0;
    let puntos_total_intento = 0;
    let correctas = 0;
    const preguntasFalladas = [];

    for (const intento of sesion.intentos) {
      if (intento.es_correcta) {
        xp_total_intento += intento.xp_ganada || 0;
        puntos_total_intento += (intento.preguntas && intento.preguntas.puntos_otorgados)
          ? intento.preguntas.puntos_otorgados
          : 10;
        correctas++;
      } else {
        preguntasFalladas.push(intento.preguntas);
      }
    }

    const totalPreguntas = sesion.intentos.length;
    const porcentajeAcertado = totalPreguntas > 0 ? (correctas / totalPreguntas) : 0;

    // ============================================================
    // 3. Cálculo dinámico de gemas
    // ============================================================
    let gemas_total_intento = Math.round(BASE_GEMAS * porcentajeAcertado);

    if (porcentajeAcertado >= 0.8) {
      gemas_total_intento += Math.round(BASE_GEMAS * 0.1); // Bonus 10%
    }

    const guiasUsadas = sesion.intentos.filter(i => i.acepto_guia).length;
    const gemasPenalizadas = guiasUsadas * PENALIZACION_POR_GUIA;

    const gemasFinalesCalculadas = Math.max(0, gemas_total_intento - gemasPenalizadas);

    const progresoAnterior = await prisma.progreso_lecciones_usuario.findUnique({
      where: { id: sesion.progreso_leccion_id },
      select: { puntaje_total: true, xp_ganada: true, gemas_ganadas: true }
    });

    // ============================================================
    // 4. Transacción de guardado final
    // ============================================================
    const [progresoActualizado, usuarioActualizado, sesionTerminada] = await prisma.$transaction([
      prisma.progreso_lecciones_usuario.update({
        where: { id: sesion.progreso_leccion_id },
        data: {
          estado: 'completado',
          puntaje_total: Math.max((progresoAnterior?.puntaje_total || 0), puntos_total_intento),
          xp_ganada: Math.max((progresoAnterior?.xp_ganada || 0), xp_total_intento),
          gemas_ganadas: Math.max((progresoAnterior?.gemas_ganadas || 0), gemasFinalesCalculadas)
        }
      }),
      prisma.usuarios.update({
        where: { id: usuarioId },
        data: {
          puntos_experiencia: { increment: xp_total_intento },
          gemas: { increment: gemasFinalesCalculadas }
        }
      }),
      prisma.quiz_session.update({
        where: { id: BigInt(sessionId) },
        data: {
          expires_at: new Date(Date.now() - 1000),
          estado: 'completado',
          puntaje_obtenido: puntos_total_intento,
          xp_obtenida: xp_total_intento,
          gemas_obtenidas: gemasFinalesCalculadas
        }
      })
    ]);

    // ============================================================
    // 5. IA Feedback
    // ============================================================
    let feedbackId = null;

    if (preguntasFalladas.length > 0) {
      try {
        const feedbackJson = await iaService.generarFeedback(preguntasFalladas);

        if (feedbackJson) {
          const nuevoFeedback = await prisma.feedback_ia.upsert({
            where: { progreso_leccion_id: progresoActualizado.id },
            update: {
              contenido_feedback: {
                puntosFuertes: feedbackJson.puntosFuertes,
                areasMejora: feedbackJson.areasMejora,
                consejosPracticos: feedbackJson.consejosPracticos,
              },
              fecha_generacion: new Date()
            },
            create: {
              progreso_leccion_id: progresoActualizado.id,
              contenido_feedback: {
                puntosFuertes: feedbackJson.puntosFuertes,
                areasMejora: feedbackJson.areasMejora,
                consejosPracticos: feedbackJson.consejosPracticos,
              }
            }
          });

          feedbackId = nuevoFeedback.id;

          await prisma.error_ejercicio.deleteMany({ where: { feedback_id: feedbackId } });

          const erroresParaGuardar = (feedbackJson.ejercicios_fallados || []).map(errorIA => ({
            feedback_id: feedbackId,
            pregunta_id: Number(errorIA.ejercicio_id),
            detalle_json: { analisis: errorIA.analisis, consejo: errorIA.consejo }
          }));

          if (erroresParaGuardar.length > 0) {
            await prisma.error_ejercicio.createMany({ data: erroresParaGuardar });
          }
        }
      } catch (iaError) {
        console.error('⚠️ Fallo en la generación de feedback IA:', iaError.message);
      }
    }

    // ============================================================
    // 6. Respuesta final
    // ============================================================
    res.json({
      message: "¡Quiz finalizado con éxito!",
      puntaje_total_intento: puntos_total_intento,
      xp_ganada_intento: xp_total_intento,
      gemas_ganadas_intento: gemasFinalesCalculadas,
      respuestas_correctas: correctas,
      total_preguntas: totalPreguntas,
      guias_usadas: guiasUsadas,
      feedback_id: feedbackId ? feedbackId.toString() : null,
      mejor_puntaje_guardado: progresoActualizado.puntaje_total,
      sessionResult: {
        sessionId: sesionTerminada.id.toString(),
        puntaje_obtenido: sesionTerminada.puntaje_obtenido,
        xp_obtenida: sesionTerminada.xp_obtenida,
        gemas_obtenidas: sesionTerminada.gemas_obtenidas,
        estado: sesionTerminada.estado
      }
    });

  } catch (error) {
    console.error('❌ Error al finalizar el quiz:', error);
    res.status(500).json({ error: 'Error al finalizar la sesión.' });
  }
};

// ============================================================
// GET /api/quiz/active
// ============================================================
exports.getActiveSession = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id);

  try {
    const sesion = await prisma.quiz_session.findFirst({
      where: { usuario_id: usuarioId, expires_at: { gt: new Date() } },
      include: {
        leccion: { include: { preguntas: { orderBy: { id: 'asc' }, include: { opciones_respuesta: true } } } },
        intentos: true
      }
    });

    if (!sesion) return res.status(204).send();

    const intentosIds = new Set(sesion.intentos.map(i => Number(i.pregunta_id)));
    const preguntas = sesion.leccion.preguntas;
    const preguntaActual = preguntas.find(p => !intentosIds.has(p.id)) || null;
    const tiempoRestanteSeg = Math.max(0, Math.floor((new Date(sesion.expires_at) - new Date()) / 1000));

    res.json({
      sessionId: sesion.id.toString(),
      leccionTitulo: sesion.leccion.titulo_leccion,
      tiempo_restante: tiempoRestanteSeg,
      totalPreguntas: preguntas.length,
      preguntas_respondidas: sesion.intentos.length,
      pregunta_actual: limpiarPreguntaParaCliente(preguntaActual)
    });

  } catch (error) {
    console.error('❌ Error al obtener sesión activa:', error);
    res.status(500).json({ error: 'Error al obtener la sesión activa.' });
  }
};

// ============================================================
// GET /api/quiz/history
// ============================================================
exports.getQuizHistory = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id);

  try {
    const historial = await prisma.quiz_session.findMany({
      where: { usuario_id: usuarioId, estado: 'completado' },
      orderBy: { id: 'desc' },
      include: {
        leccion: {
          select: {
            id: true,
            titulo_leccion: true,
            temas: { select: { nombre_tema: true } }
          }
        },
        progreso_leccion: {
          select: {
            intentos: true,
            feedback_ia: { select: { id: true } }
          }
        }
      }
    });

    const resultado = historial.map(s => ({
      sessionId: s.id.toString(),
      leccionId: s.leccion_id,
      tituloLeccion: s.leccion?.titulo_leccion || null,
      nombreTema: s.leccion?.temas?.nombre_tema || null,
      puntaje_total: s.puntaje_obtenido || 0,
      xp_ganada: s.xp_obtenida || 0,
      gemas_ganadas: s.gemas_obtenidas || 0,
      intentos_totales: s.progreso_leccion ? (s.progreso_leccion.intentos || 0) : 0,
      feedbackId: s.progreso_leccion?.feedback_ia ? s.progreso_leccion.feedback_ia.id.toString() : null,
      fecha: s.fecha_inicio
    }));

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error al obtener historial de quizzes:', error);
    res.status(500).json({ error: 'Error al obtener el historial de quizzes.' });
  }
};

// ============================================================
// GET /api/quiz/podium/:leccionId
// ============================================================
exports.getQuizPodium = async (req, res) => {
  const { leccionId } = req.params;

  try {
    const top = await prisma.progreso_lecciones_usuario.findMany({
      where: { leccion_id: Number(leccionId), estado: 'completado' },
      orderBy: { puntaje_total: 'desc' },
      take: 3,
      include: { usuarios: true }
    });

    if (!top || top.length === 0) {
      return res.status(404).json({ error: 'No hay resultados para esta lección.' });
    }

    const podium = top.map((p, idx) => ({
      position: idx + 1,
      usuarioId: p.usuario_id.toString(),
      nombre: p.usuarios ? `${p.usuarios.nombre || ''} ${p.usuarios.apellido || ''}`.trim() : null,
      puntaje_total: p.puntaje_total || 0,
      xp_ganada: p.xp_ganada || 0,
      gemas_ganadas: p.gemas_ganadas || 0
    }));

    res.json(podium);

  } catch (error) {
    console.error('❌ Error al obtener podio:', error);
    res.status(500).json({ error: 'Error al obtener el podio.' });
  }
};

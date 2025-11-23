const prisma = require('../prismaClient');

// ============================================================
// GET /api/progreso/leccion/:leccionId
// (Para las pantallas "0/20" y "20/20")
// ============================================================
exports.getProgresoPorLeccion = async (req, res) => {
  const leccionId = Number(req.params.leccionId);
  const usuarioId = BigInt(req.usuario.id);

  try {
    const leccion = await prisma.lecciones.findUnique({
      where: { id: leccionId },
      include: {
        preguntas: {
          select: { id: true, puntos_otorgados: true },
          orderBy: { id: 'asc' }
        },
        progreso_lecciones_usuario: {
          where: { usuario_id: usuarioId },
          include: {
            feedback_ia: { select: { id: true } }
          }
        }
      }
    });

    if (!leccion) {
      return res.status(404).json({ error: 'Lección no encontrada.' });
    }

    const puntajeMaximo = leccion.preguntas.reduce((sum, q) => sum + (q.puntos_otorgados || 10), 0);
    const progreso = leccion.progreso_lecciones_usuario[0] || null;

    const ejercicios = leccion.preguntas.map((pregunta, index) => ({
      id: pregunta.id,
      titulo: `Ejercicio N° ${index + 1}`,
      estado: (progreso && progreso.estado === 'completado') ? 'Completo' : 'Incompleto'
    }));

    const respuesta = {
      leccionTitulo: leccion.titulo_leccion,
      estado: progreso ? progreso.estado : 'no_iniciado',
      puntajeActual: progreso ? progreso.puntaje_total : 0,
      puntajeMaximo: puntajeMaximo,

      // --- ✅ REQUERIMIENTO CUMPLIDO (Para la pantalla "20/20") ---
      xpGanada: progreso ? progreso.xp_ganada : 0,
      gemasGanadas: progreso ? progreso.gemas_ganadas : 0,
      // ---------------------------------------------------------

      feedbackId: (progreso && progreso.feedback_ia) ? progreso.feedback_ia.id.toString() : null,
      ejercicios: ejercicios
    };

    res.json(respuesta);

  } catch (error) {
    console.error('❌ Error al obtener el progreso de la lección:', error.message);
    res.status(500).json({ error: 'Error al obtener el progreso de la lección.' });
  }
};

// ============================================================
// GET /api/progreso/historial
// (Para la pantalla "Logros y Recompensas" - AHORA usa los intentos)
// ============================================================
exports.getProgresoConFeedback = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id);

  try {
    // Buscamos en quiz_session (cada intento) los quizzes completados
    const historialIntentos = await prisma.quiz_session.findMany({
      where: {
        usuario_id: usuarioId,
        estado: 'completado', // Solo quizzes terminados
      },
      orderBy: {
        id: 'desc', // Mostrar los intentos más recientes primero
      },
      include: {
        leccion: { // Obtenemos el título de la lección
          select: {
            id: true,
            titulo_leccion: true,
            temas: { // Obtenemos el nombre del tema (Semana)
              select: { nombre_tema: true }
            }
          },
        },
        progreso_leccion: { 
          // Para obtener el feedbackId (que está en la tabla de resumen)
          select: {
            feedback_ia: {
              select: { id: true }
            },
            intentos: true // Para obtener el N° total de intentos
          }
        }
      },
    });

    // Limpiamos la respuesta para que coincida con tu imagen
    const resultadoLimpio = historialIntentos.map((intento) => ({
      // ID de este intento (sesión)
      intentoId: intento.id.toString(), 
      leccionId: intento.leccion_id,
      
      tituloLeccion: intento.leccion?.titulo_leccion || null, // "Evaluación de SEM1"
      nombreTema: intento.leccion?.temas?.nombre_tema || null, // "Ecuaciones lineales"

      // ✅ Datos de ESE intento
      puntaje_total: intento.puntaje_obtenido || 0, // (ej. 18)
      xp_ganada: intento.xp_obtenida || 0,         // (ej. +216 PUNTOS)
      gemas_ganadas: intento.gemas_obtenidas || 0, // (ej. 12)
      
      // Número total de intentos para ESA lección (desde el registro de progreso)
      intentos_totales: intento.progreso_leccion ? (intento.progreso_leccion.intentos || 0) : 0,

      feedbackId: (intento.progreso_leccion && intento.progreso_leccion.feedback_ia) 
                  ? intento.progreso_leccion.feedback_ia.id.toString() 
                  : null,

      fecha_intento: intento.fecha_inicio
    }));

    res.json(resultadoLimpio);

  } catch (error) {
    console.error('❌ Error al obtener el progreso con feedback:', error.message);
    res.status(500).json({ error: 'Error al obtener el progreso.' });
  }
};

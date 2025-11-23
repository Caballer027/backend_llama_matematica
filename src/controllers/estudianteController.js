// src/controllers/estudianteController.js
const prisma = require('../prismaClient');

// Función helper para formatear segundos a "Xh Ymin"
function formatearSegundos(segundosTotales) {
  if (segundosTotales === 0) return "0min";
  const horas = Math.floor(segundosTotales / 3600);
  const minutos = Math.floor((segundosTotales % 3600) / 60);
  
  let resultado = "";
  if (horas > 0) {
    resultado += `${horas}h `;
  }
  if (minutos > 0) {
    resultado += `${minutos}min`;
  }
  return resultado.trim();
}


// GET /api/estudiante/estadisticas
exports.obtenerEstadisticas = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id); // <- tomado del token

  try {
    // 🧩 1. Evolución de puntaje (agrupado por mes)
    // (Tu lógica original de 'intentos_usuario' es correcta para esto)
    const intentos = await prisma.intentos_usuario.findMany({
      where: { usuario_id: usuarioId },
      select: {
        fecha_intento: true,
        es_correcta: true,
      },
    });

    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const puntajePorMes = {};
    for (const intento of intentos) {
      if (!intento.fecha_intento) continue;
      const mesIndex = new Date(intento.fecha_intento).getMonth();
      const mes = meses[mesIndex];
      if (!puntajePorMes[mes]) puntajePorMes[mes] = { correctas: 0, total: 0 };
      if (intento.es_correcta) puntajePorMes[mes].correctas++;
      puntajePorMes[mes].total++;
    }

    const evolucionPuntaje = Object.keys(puntajePorMes).map(mes => ({
      mes,
      porcentaje: Math.round((puntajePorMes[mes].correctas / puntajePorMes[mes].total) * 100)
    }));
    
    // --- 🕓 2. Tiempo dedicado (¡LÓGICA CORREGIDA!) ---
    const sesionesCompletadas = await prisma.quiz_session.findMany({
      where: {
        usuario_id: usuarioId,
        estado: 'completado' // Solo contamos quizzes terminados
      },
      select: {
        fecha_inicio: true,
        expires_at: true, // Esta es la fecha en que terminó
        tiempo_limite_segundos: true
      }
    });

    let segundosTotalesDedicados = 0;
    for (const sesion of sesionesCompletadas) {
      // Calculamos cuánto duró la sesión
      const inicio = new Date(sesion.fecha_inicio).getTime();
      const fin = new Date(sesion.expires_at).getTime();
      const duracionMilisegundos = fin - inicio;
      
      // Lo convertimos a segundos y lo sumamos
      segundosTotalesDedicados += duracionMilisegundos / 1000;
    }
    
    // Formateamos el total
    const tiempoDedicado = formatearSegundos(segundosTotalesDedicados);
    // --- Fin del cálculo de tiempo ---


    // 🎯 3. Progreso en curso (porcentaje de lecciones completadas)
    // (Tu lógica original es correcta)
    const totalLecciones = await prisma.lecciones.count();
    const completadas = await prisma.progreso_lecciones_usuario.count({
      where: {
        usuario_id: usuarioId,
        estado: 'completado',
      },
    });

    const progresoPorcentaje = totalLecciones > 0
      ? Math.round((completadas / totalLecciones) * 100)
      : 0;

    const progreso = {
      curso: "Cálculo y Estadística", // (Placeholder)
      porcentaje: progresoPorcentaje,
    };

    // 📊 4. Tasa de repetición agrupada por tema
    // (Tu lógica original es correcta, solo ajustamos los nombres)
    const repeticiones = await prisma.intentos_usuario.groupBy({
      by: ['pregunta_id'],
      where: { usuario_id: usuarioId },
      _count: { id: true },
    });

    const tasaRepeticion = await Promise.all(
      repeticiones.map(async (r) => {
        const pregunta = await prisma.preguntas.findUnique({
          where: { id: r.pregunta_id },
          // ✅ CORRECCIÓN: Usamos 'lecciones.temas.nombre_tema'
          select: { lecciones: { select: { temas: { select: { nombre_tema: true } } } } },
        });

        const tema = pregunta?.lecciones?.temas?.nombre_tema || "Desconocido";
        return { tema, repeticiones: r._count.id };
      })
    );

    const agrupadoPorTema = {};
    for (const item of tasaRepeticion) {
      agrupadoPorTema[item.tema] = (agrupadoPorTema[item.tema] || 0) + item.repeticiones;
    }

    const tasaRepeticionFinal = Object.keys(agrupadoPorTema).map(tema => ({
      tema,
      repeticiones: agrupadoPorTema[tema],
    }));

    // ✅ Respuesta final
    res.json({
      evolucionPuntaje,
      tiempoDedicado, // <-- Ahora es un valor dinámico
      progreso,
      tasaRepeticion: tasaRepeticionFinal,
    });

  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas del estudiante" });
  }
};
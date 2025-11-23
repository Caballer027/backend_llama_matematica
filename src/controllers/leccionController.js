// src/controllers/leccionController.js
// (Versión LIMPIA - Solo con la lógica que SÍ usamos)

const prisma = require('../prismaClient');

// ============================================================
// GET /api/lecciones/:id
// ============================================================
exports.getLeccionById = async (req, res) => {
  const { id } = req.params;
  try {
    const leccion = await prisma.lecciones.findUnique({
      where: { id: Number(id) },
      include: {
        preguntas: {
          orderBy: { id: 'asc' }, // Ordenamos las preguntas
          include: {
            opciones_respuesta: {
              select: { id: true, texto_respuesta: true },
            },
          },
        },
      },
    });
    // ... (el resto de tu función getLeccionById está perfecta)
    // ...
    if (!leccion) {
      return res.status(404).json({ error: 'Lección no encontrada.' });
    }
    const leccionParaUsuario = { /* ... (tu mapeo para ocultar respuestas) ... */ };
    res.json(leccionParaUsuario);

  } catch (error) {
    console.error('❌ Error al obtener la lección:', error);
    res.status(500).json({ error: 'Error interno al obtener la lección.' });
  }
};

// ============================================================
// GET /api/lecciones/:id/ranking (Podio Top 10)
// ¡Esta función ya la tenías y está perfecta!
// ============================================================
exports.getRankingByLeccion = async (req, res) => {
  const leccionId = Number(req.params.id);
  try {
    const ranking = await prisma.progreso_lecciones_usuario.findMany({
      where: { leccion_id: leccionId },
      orderBy: { puntaje_total: 'desc' }, // Ordena por el mejor puntaje
      take: 10,
      select: {
        puntaje_total: true,
        usuarios: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    const result = ranking.map((r, index) => ({
      puesto: index + 1,
      nombre: r.usuarios?.nombre || 'Desconocido',
      apellido: r.usuarios?.apellido || '',
      puntos: r.puntaje_total || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Error al obtener el ranking de la lección:', error);
    res.status(500).json({ error: 'Error interno al obtener el ranking.' });
  }
};
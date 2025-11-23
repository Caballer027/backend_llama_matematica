// src/controllers/temaController.js
const prisma = require('../prismaClient'); // (Usamos tu importación original)

// ============================================================
// GET /api/temas/:id (Para la pantalla de "Historia")
// ¡CORREGIDO CON LOS NOMBRES DE CAMPO REALES!
// ============================================================
exports.getTemaById = async (req, res) => {
  const temaId = Number(req.params.id);

  try {
    const tema = await prisma.temas.findUnique({
      where: { id: temaId },
      select: {
        id: true,
        nombre_tema: true,
        titulo_pregunta: true,
        historia_introduccion: true,
        historia_nudo: true,
        historia_desenlace: true,
        
        // --- 👇 CORRECCIÓN BASADA EN TU LOG DE ERROR ---
        url_imagen_inicio: true,  // (Antes era imagen_intro)
        url_imagen_nudo: true,    // (Antes era imagen_nudo)
        url_imagen_desenlace: true // (Antes era imagen_desenlace)
      }
    });

    if (!tema) {
      return res.status(404).json({ error: 'Tema no encontrado.' });
    }

    res.json(tema);

  } catch (error) {
    console.error('❌ Error al obtener el tema:', error.message);
    res.status(500).json({ error: 'Error al obtener los detalles del tema.' });
  }
};


// ============================================================
// GET /api/temas/:id/lecciones (Esta función ya la tenías)
// ============================================================
exports.getLeccionesPorTema = async (req, res) => {
  const temaId = Number(req.params.id);

  try {
    const temaConLecciones = await prisma.temas.findUnique({
      where: { id: temaId },
      include: {
        lecciones: {
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            titulo_leccion: true,
            orden: true,
          },
        },
      },
    });

    if (!temaConLecciones) {
      return res.status(404).json({ error: 'Tema no encontrado.' });
    }

    res.json(temaConLecciones.lecciones);
  } catch (error) {
    console.error('❌ Error al obtener las lecciones del tema:', error);
    res.status(500).json({ error: 'Error al obtener las lecciones.' });
  }
};
// src/controllers/rankingController.js
const prisma = require('../prismaClient');

// ============================================================
// 🎓 RANKING POR INSTITUTO (GLOBAL)
// ============================================================
exports.getRankingByInstituto = async (req, res) => {
  const { idInstituto } = req.params;

  try {
    const ranking = await prisma.usuarios.findMany({
      where: { institucion_id: Number(idInstituto) },
      select: {
        nombre: true,
        apellido: true,
        // ✅ CORREGIDO: "carreras" -> "carrera" (singular)
        carrera: { 
          select: {
            nombre: true,
          },
        },
        puntos_experiencia: true,
      },
      orderBy: { puntos_experiencia: 'desc' },
      take: 50,
    });

    const formatted = ranking.map((r, index) => ({
      puesto: index + 1,
      nombre: r.nombre,
      apellido: r.apellido,
      // ✅ CORREGIDO: "r.carreras?.nombre" -> "r.carrera?.nombre"
      carrera: r.carrera?.nombre || 'Sin carrera', 
      total_experiencia: r.puntos_experiencia,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error al obtener ranking por instituto:', error);
    res.status(500).json({ error: 'Error al obtener ranking por instituto' });
  }
};

// ============================================================
// 📚 RANKING POR CARRERA (GLOBAL)
// (Esta función estaba bien)
// ============================================================
exports.getRankingByCarrera = async (req, res) => {
  // ... (El resto de tu controlador está perfecto)
  const { idCarrera } = req.params;

  try {
    const ranking = await prisma.usuarios.findMany({
      where: { carrera_id: Number(idCarrera) },
      select: {
        nombre: true,
        apellido: true,
        puntos_experiencia: true,
      },
      orderBy: { puntos_experiencia: 'desc' },
      take: 50,
    });

    const formatted = ranking.map((r, index) => ({
      puesto: index + 1,
      nombre: r.nombre,
      apellido: r.apellido,
      total_experiencia: r.puntos_experiencia,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error al obtener ranking por carrera:', error);
    res.status(500).json({ error: 'Error al obtener ranking por carrera' });
  }
};
// src/controllers/ciclosController.js
const prisma = require('../prismaClient');

// Obtener todos los ciclos disponibles
exports.getCiclos = async (req, res) => {
  try {
    // ✅ CORREGIDO: "ciclos" -> "ciclo" (singular)
    const ciclos = await prisma.ciclo.findMany({
      // ✅ CORREGIDO: "numero_ciclo" -> "numero" (según tu schema)
      orderBy: { numero: 'asc' }, 
      select: {
        id: true,
        // ✅ CORREGIDO: "nombre_ciclo" -> "nombre" (según tu schema)
        nombre: true,
        numero: true
      }
    });

    if (ciclos.length === 0) {
      return res.status(404).json({ message: "No se encontraron ciclos." });
    }

    // Devolvemos los nombres corregidos
    const respuesta = ciclos.map(c => ({
        id: c.id,
        nombre_ciclo: c.nombre, // Mantenemos el nombre de la API si quieres
        numero_ciclo: c.numero
    }));

    res.status(200).json(respuesta);
  } catch (error) {
    console.error("❌ Error al obtener ciclos:", error);
    res.status(500).json({ error: "Error interno al obtener ciclos." });
  }
};
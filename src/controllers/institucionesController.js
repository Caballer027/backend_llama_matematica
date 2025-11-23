// src/controllers/institucionesController.js

// 💡 SOLUCIÓN 1: Arreglamos la importación para asegurar que 'prisma' esté definido
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const prisma = require('../prismaClient'); // (Comentamos la importación antigua)

// 🔹 Obtener todas las instituciones
exports.getInstituciones = async (req, res) => {
  try {
    // 💡 SOLUCIÓN 2: Usamos el nombre del modelo en singular: 'institucion'
    const instituciones = await prisma.institucion.findMany({
      select: {
        id: true,
        // 💡 SOLUCIÓN 3: Usamos el nombre del campo correcto: 'nombre'
        nombre: true,
      },
      orderBy: { 
        // 💡 SOLUCIÓN 3: Usamos el nombre del campo correcto: 'nombre'
        nombre: 'asc' 
      },
    });

    if (instituciones.length === 0) {
      return res.status(404).json({ message: 'No se encontraron instituciones' });
    }

    res.json(instituciones);
  } catch (error) {
    console.error('❌ Error al obtener instituciones:', error);
    res.status(500).json({ error: 'Error al obtener instituciones' });
  }
};

// 🔹 Obtener las carreras de una institución específica
exports.getCarrerasByInstitucion = async (req, res) => {
  const { id } = req.params;
  try {
    // 💡 SOLUCIÓN 2: Usamos el nombre del modelo en singular: 'carrera'
    const carreras = await prisma.carrera.findMany({
      where: { institucion_id: Number(id) },
      select: {
        id: true,
        // 💡 SOLUCIÓN 3: Usamos el nombre del campo correcto: 'nombre'
        nombre: true,
      },
      orderBy: { 
        // 💡 SOLUCIÓN 3: Usamos el nombre del campo correcto: 'nombre'
        nombre: 'asc' 
      },
    });

    if (carreras.length === 0) {
      return res.status(404).json({ message: 'No se encontraron carreras para esta institución' });
    }

    res.json(carreras);
  } catch (error) {
    console.error('❌ Error al obtener carreras:', error);
    res.status(500).json({ error: 'Error al obtener carreras' });
  }
};
// src/controllers/ciclosController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/ciclos (Tu función original)
exports.getCiclos = async (req, res) => {
  try {
    const ciclos = await prisma.ciclo.findMany({
      orderBy: { numero: 'asc' },
      select: { id: true, nombre: true, numero: true }
    });
    res.status(200).json(ciclos);
  } catch (error) {
    console.error("❌ Error al obtener ciclos:", error);
    res.status(500).json({ error: "Error interno al obtener ciclos." });
  }
};

// ============================================================
// 🔥 NUEVOS ENDPOINTS CRUD (SOLO ADMIN)
// ============================================================

// POST /api/ciclos
exports.createCiclo = async (req, res) => {
  const { nombre, numero } = req.body;
  if (!nombre || !numero) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    const nuevo = await prisma.ciclo.create({ data: { nombre, numero: Number(numero) } });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ciclo' });
  }
};

// PUT /api/ciclos/:id
exports.updateCiclo = async (req, res) => {
  const { id } = req.params;
  const { nombre, numero } = req.body;
  
  try {
    const actualizado = await prisma.ciclo.update({
      where: { id: Number(id) },
      data: { nombre, numero: Number(numero) }
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ciclo' });
  }
};

// DELETE /api/ciclos/:id
exports.deleteCiclo = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.ciclo.delete({ where: { id: Number(id) } });
    res.json({ message: 'Ciclo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'No se puede eliminar (tiene cursos asociados)' });
  }
};
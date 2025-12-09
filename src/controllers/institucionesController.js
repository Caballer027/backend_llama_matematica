// src/controllers/institucionesController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// GET /api/instituciones
// ============================================================
exports.getInstituciones = async (req, res) => {
  try {
    const instituciones = await prisma.institucion.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    res.json(instituciones);
  } catch (error) {
    console.error('❌ Error al obtener instituciones:', error);
    res.status(500).json({ error: 'Error al obtener instituciones' });
  }
};

// ============================================================
// 🔥 CRUD (SOLO ADMIN)
// ============================================================

// POST /api/instituciones
exports.createInstitucion = async (req, res) => {
  const { nombre, dominio_correo } = req.body;

  if (!nombre)
    return res.status(400).json({ error: 'Nombre requerido' });

  try {
    const nueva = await prisma.institucion.create({
      data: { nombre, dominio_correo }
    });

    res.status(201).json(nueva);
  } catch (error) {
    if (error.code === 'P2002')
      return res.status(409).json({ error: 'Ya existe esa institución' });

    console.error('❌ Error al crear institución:', error);
    res.status(500).json({ error: 'Error al crear institución' });
  }
};

// PUT /api/instituciones/:id
exports.updateInstitucion = async (req, res) => {
  const { id } = req.params;
  const { nombre, dominio_correo } = req.body;

  if (isNaN(id))
    return res.status(400).json({ error: 'ID inválido' });

  try {
    const actualizada = await prisma.institucion.update({
      where: { id: Number(id) },
      data: { nombre, dominio_correo }
    });

    res.json(actualizada);
  } catch (error) {
    if (error.code === 'P2025')
      return res.status(404).json({ error: 'Institución no encontrada' });

    console.error('❌ Error al actualizar institución:', error);
    res.status(500).json({ error: 'Error al actualizar institución' });
  }
};

// DELETE /api/instituciones/:id
exports.deleteInstitucion = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id))
    return res.status(400).json({ error: 'ID inválido' });

  try {
    await prisma.institucion.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Institución eliminada' });
  } catch (error) {
    if (error.code === 'P2025')
      return res.status(404).json({ error: 'Institución no encontrada' });

    console.error('❌ Error al eliminar institución:', error);
    res.status(500).json({
      error: 'Error al eliminar (puede tener carreras o alumnos asociados)'
    });
  }
};

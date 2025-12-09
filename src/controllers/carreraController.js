// src/controllers/carreraController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// GET /api/carreras
// ============================================================
exports.getAllCarreras = async (req, res) => {
  try {
    const carreras = await prisma.carrera.findMany({
      include: {
        institucion: {
          select: { nombre: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    const respuesta = carreras.map(c => ({
      id: c.id,
      nombre: c.nombre,
      institucion_id: c.institucion_id,
      nombre_institucion: c.institucion.nombre
    }));

    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error al obtener carreras:', error);
    res.status(500).json({ error: 'Error al obtener carreras.' });
  }
};

// ============================================================
// NUEVO: GET /api/carreras/institucion/:id
// ============================================================
exports.getCarrerasByInstitucion = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id))
    return res.status(400).json({ error: 'ID inválido' });

  try {
    const carreras = await prisma.carrera.findMany({
      where: { institucion_id: Number(id) },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    res.json(carreras);
  } catch (error) {
    console.error('❌ Error al obtener carreras por institución:', error);
    res.status(500).json({ error: 'Error al obtener carreras por institución' });
  }
};

// ============================================================
// CRUD ADMIN
// ============================================================

// POST /api/carreras
exports.createCarrera = async (req, res) => {
  const { nombre, institucion_id } = req.body;

  if (!nombre || !institucion_id)
    return res.status(400).json({ error: 'Nombre e ID de institución requeridos.' });

  try {
    const nueva = await prisma.carrera.create({
      data: {
        nombre,
        institucion_id: Number(institucion_id)
      }
    });

    res.status(201).json(nueva);
  } catch (error) {
    if (error.code === 'P2002')
      return res.status(409).json({ error: 'Ya existe una carrera con ese nombre.' });

    if (error.code === 'P2003')
      return res.status(400).json({ error: 'La institución no existe.' });

    console.error('❌ Error al crear carrera:', error);
    res.status(500).json({ error: 'Error al crear carrera.' });
  }
};

// PUT /api/carreras/:id
exports.updateCarrera = async (req, res) => {
  const { id } = req.params;
  const { nombre, institucion_id } = req.body;

  if (isNaN(id))
    return res.status(400).json({ error: 'ID inválido' });

  try {
    const actualizada = await prisma.carrera.update({
      where: { id: Number(id) },
      data: {
        nombre,
        institucion_id: institucion_id ? Number(institucion_id) : undefined
      }
    });

    res.json(actualizada);
  } catch (error) {
    if (error.code === 'P2025')
      return res.status(404).json({ error: 'Carrera no encontrada' });

    if (error.code === 'P2003')
      return res.status(400).json({ error: 'La institución no existe.' });

    console.error('❌ Error al actualizar carrera:', error);
    res.status(500).json({ error: 'Error al actualizar carrera.' });
  }
};

// DELETE /api/carreras/:id
exports.deleteCarrera = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id))
    return res.status(400).json({ error: 'ID inválido' });

  try {
    await prisma.carrera.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Carrera eliminada correctamente.' });
  } catch (error) {
    if (error.code === 'P2003')
      return res.status(400).json({ error: 'No se puede eliminar: Hay ciclos o alumnos vinculados.' });

    if (error.code === 'P2025')
      return res.status(404).json({ error: 'Carrera no encontrada.' });

    console.error('❌ Error al eliminar carrera:', error);
    res.status(500).json({ error: 'Error al eliminar carrera.' });
  }
};

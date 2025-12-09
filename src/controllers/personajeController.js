// src/controllers/personajeController.js (V5 – COMPLETO, CORREGIDO y OPTIMIZADO)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// ============================================================
// GET /api/personajes
// ============================================================
exports.getAllPersonajes = async (req, res) => {
  try {
    const personajes = await prisma.personajes.findMany({
      select: {
        id: true,
        nombre: true,
        asset_key: true,
        url_imagen_base: true,
        mensaje_corta: true,
        mensaje_larga: true,
      }
    });

    res.json(personajes);

  } catch (error) {
    console.error('Error al obtener personajes:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener personajes'
    });
  }
};

// ============================================================
// POST /api/personajes/seleccionar
// ============================================================
exports.seleccionarPersonaje = async (req, res) => {
  const usuarioId = Number(req.usuario.id);
  const { personajeId } = req.body;

  if (!personajeId) {
    return res.status(400).json({
      error: 'El ID del personaje es requerido'
    });
  }

  const personajeIdNum = Number(personajeId);

  try {
    const personaje = await prisma.personajes.findUnique({
      where: { id: personajeIdNum }
    });

    if (!personaje) {
      return res.status(404).json({
        error: 'Personaje no encontrado'
      });
    }

    const usuarioActualizado = await prisma.usuarios.update({
      where: { id: usuarioId },
      data: { personaje_activo_id: personajeIdNum },
      select: {
        personaje_activo: {
          select: {
            id: true,
            nombre: true,
            asset_key: true,
            url_imagen_base: true,
            mensaje_corta: true,
            mensaje_larga: true,
          }
        }
      }
    });

    res.json({
      message: `¡Has seleccionado a ${usuarioActualizado.personaje_activo.nombre}!`,
      personajeActivo: usuarioActualizado.personaje_activo
    });

  } catch (error) {
    console.error('Error al seleccionar personaje:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.status(500).json({
      error: 'Error interno al seleccionar personaje'
    });
  }
};

// ============================================================
// POST /api/personajes (Crear personaje)
// ============================================================
exports.createPersonaje = async (req, res) => {
  const { nombre, asset_key, mensaje_corta, mensaje_larga } = req.body;
  const file = req.file;

  if (!nombre || !asset_key || !file) {
    return res.status(400).json({
      error: 'Faltan datos obligatorios o la imagen base.'
    });
  }

  try {
    const url_imagen_base = '/assets/' + file.filename;

    const nuevo = await prisma.personajes.create({
      data: {
        nombre,
        asset_key,
        mensaje_corta,
        mensaje_larga,
        url_imagen_base
      }
    });

    res.status(201).json(nuevo);

  } catch (error) {
    console.error('Error al crear personaje:', error);
    res.status(500).json({
      error: 'Error interno al crear personaje.'
    });
  }
};

// ============================================================
// PUT /api/personajes/:id (Actualizar personaje)
// ============================================================
exports.updatePersonaje = async (req, res) => {
  const { id } = req.params;
  const { nombre, mensaje_corta, mensaje_larga } = req.body;
  const file = req.file;

  try {
    const personaje = await prisma.personajes.findUnique({
      where: { id: Number(id) }
    });

    if (!personaje) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    let url_imagen_base = personaje.url_imagen_base;

    if (file) {
      if (url_imagen_base) {
        const oldPath = path.join(__dirname, '../../public', url_imagen_base);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      url_imagen_base = '/assets/' + file.filename;
    }

    const actualizado = await prisma.personajes.update({
      where: { id: Number(id) },
      data: {
        nombre,
        mensaje_corta,
        mensaje_larga,
        url_imagen_base
      }
    });

    res.json(actualizado);

  } catch (error) {
    console.error('Error al actualizar personaje:', error);
    res.status(500).json({
      error: 'Error interno al actualizar personaje.'
    });
  }
};

// ============================================================
// DELETE /api/personajes/:id  🔥 (LIMPIEZA PROFUNDA COMPLETA)
// ============================================================
exports.deletePersonaje = async (req, res) => {
  const { id } = req.params;

  try {
    const personaje = await prisma.personajes.findUnique({
      where: { id: Number(id) }
    });

    if (!personaje) {
      return res.status(404).json({ error: 'Personaje no encontrado' });
    }

    const keyToDelete = personaje.asset_key; // ej: "LEON"

    await prisma.$transaction(async (tx) => {

      // A. Eliminar avatar base del personaje
      if (personaje.url_imagen_base) {
        const avatarPath = path.join(__dirname, '../../public', personaje.url_imagen_base);
        if (fs.existsSync(avatarPath)) {
          try { fs.unlinkSync(avatarPath); } catch (e) {}
        }
      }

      // B. Limpieza profunda en items
      const items = await tx.items.findMany();

      for (const item of items) {
        const equipado = item.url_imagenes_equipado || {};

        if (equipado[keyToDelete]) {
          const rutaRopa = equipado[keyToDelete];

          if (rutaRopa !== item.url_icono_tienda) {
            const ropaPath = path.join(__dirname, '../../public', rutaRopa);
            if (fs.existsSync(ropaPath)) {
              try { fs.unlinkSync(ropaPath); } catch (e) {}
            }
          }

          delete equipado[keyToDelete];

          await tx.items.update({
            where: { id: item.id },
            data: { url_imagenes_equipado: equipado }
          });
        }
      }

      // C. Borrar personaje
      await tx.personajes.delete({
        where: { id: Number(id) }
      });
    });

    res.json({
      message: `Personaje ${personaje.nombre} y sus assets asociados eliminados correctamente.`
    });

  } catch (error) {
    console.error('Error al eliminar personaje:', error);

    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'No se puede eliminar: Hay usuarios usando este personaje.'
      });
    }

    res.status(500).json({
      error: 'Error interno al eliminar personaje.'
    });
  }
};

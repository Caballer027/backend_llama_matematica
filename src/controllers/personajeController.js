// ============================================================
// src/controllers/personajeController.js — V6 (CLOUDINARY MIGRADO)
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// const path = require('path');   // ❌ YA NO SE USA PARA AVATARES
// const fs = require('fs');       // ❌ YA NO SE USA PARA AVATARES

// ============================================================
// CLOUDINARY
// ============================================================
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Extraer el public_id desde una URL de Cloudinary
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  const parts = url.split('/');
  const versionIndex = parts.findIndex(p => p.startsWith('v'));
  if (versionIndex === -1) return null;
  const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
  return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
};

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

  try {
    const personaje = await prisma.personajes.findUnique({
      where: { id: Number(personajeId) }
    });

    if (!personaje) {
      return res.status(404).json({
        error: 'Personaje no encontrado'
      });
    }

    const usuarioActualizado = await prisma.usuarios.update({
      where: { id: usuarioId },
      data: { personaje_activo_id: Number(personajeId) },
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
    // AHORA SE USA LA URL COMPLETA DE CLOUDINARY
    const url_imagen_base = file.path;

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
      // BORRAR LA IMAGEN ANTERIOR EN CLOUDINARY
      if (url_imagen_base) {
        const publicId = extractPublicId(url_imagen_base);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }

      // NUEVA IMG - URL DE CLOUDINARY
      url_imagen_base = file.path;
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
// DELETE /api/personajes/:id 🔥 (Cloudinary MIGRADO)
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

    const keyToDelete = personaje.asset_key;

    await prisma.$transaction(async (tx) => {

      // A. ELIMINAR AVATAR BASE EN CLOUDINARY
      if (personaje.url_imagen_base) {
        const publicId = extractPublicId(personaje.url_imagen_base);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }

      // B. LIMPIEZA PROFUNDA EN ITEMS (SE DEJA IGUAL - PENDIENTE MIGRACIÓN)
      const items = await tx.items.findMany();

      for (const item of items) {
        const equipado = item.url_imagenes_equipado || {};

        if (equipado[keyToDelete]) {
          // 🚫 ESTA ROPA SIGUE EN DISCO — SE MIGRARÁ EN MÓDULO ITEMS
          const path = require('path');
          const fs = require('fs');

          const rutaRopa = equipado[keyToDelete];
          const ropaPath = path.join(__dirname, '../../public', rutaRopa);

          if (fs.existsSync(ropaPath)) {
            try { fs.unlinkSync(ropaPath); } catch (e) {}
          }

          delete equipado[keyToDelete];

          await tx.items.update({
            where: { id: item.id },
            data: { url_imagenes_equipado: equipado }
          });
        }
      }

      // C. ELIMINAR PERSONAJE
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

// ============================================================
// src/controllers/temaController.js (VERSIÓN CLOUDINARY COMPLETA)
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const fs = require('fs');
// const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// ============================================================
// CLOUDINARY CONFIG
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================================
// Función auxiliar para extraer el public_id desde una URL
// ============================================================
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;

  const parts = url.split('/');
  const versionIndex = parts.findIndex((p) => p.startsWith('v'));
  if (versionIndex === -1) return null;

  const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
  return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
};

// ============================================================
// GET /api/temas/:id
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
        url_imagen_inicio: true,
        url_imagen_nudo: true,
        url_imagen_desenlace: true,
      },
    });

    if (!tema) return res.status(404).json({ error: "Tema no encontrado." });

    res.json(tema);
  } catch (error) {
    console.error("❌ Error al obtener el tema:", error.message);
    res.status(500).json({ error: "Error al obtener los detalles del tema." });
  }
};

// ============================================================
// GET /api/temas/:id/lecciones
// ============================================================
exports.getLeccionesPorTema = async (req, res) => {
  const temaId = Number(req.params.id);

  try {
    const temaConLecciones = await prisma.temas.findUnique({
      where: { id: temaId },
      include: {
        lecciones: {
          orderBy: { orden: "asc" },
          select: { id: true, titulo_leccion: true, orden: true },
        },
      },
    });

    if (!temaConLecciones)
      return res.status(404).json({ error: "Tema no encontrado." });

    res.json(temaConLecciones.lecciones);
  } catch (error) {
    console.error("❌ Error al obtener las lecciones del tema:", error);
    res.status(500).json({ error: "Error al obtener las lecciones." });
  }
};

// ============================================================
// POST /api/temas → Crear tema con imágenes (Cloudinary)
// ============================================================
exports.createTema = async (req, res) => {
  const {
    curso_id,
    nombre_tema,
    orden,
    titulo_pregunta,
    historia_introduccion,
    historia_nudo,
    historia_desenlace,
  } = req.body;

  const files = req.files || {};

  if (!curso_id || !nombre_tema || !orden) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (curso_id, nombre_tema, orden).",
    });
  }

  try {
    const imgInicio = files.imagen_inicio ? files.imagen_inicio[0].path : null;
    const imgNudo = files.imagen_nudo ? files.imagen_nudo[0].path : null;
    const imgDesenlace = files.imagen_desenlace ? files.imagen_desenlace[0].path : null;

    const nuevoTema = await prisma.temas.create({
      data: {
        curso_id: Number(curso_id),
        nombre_tema,
        orden: Number(orden),
        titulo_pregunta,
        historia_introduccion,
        historia_nudo,
        historia_desenlace,
        url_imagen_inicio: imgInicio,
        url_imagen_nudo: imgNudo,
        url_imagen_desenlace: imgDesenlace,
      },
    });

    res.status(201).json(nuevoTema);
  } catch (error) {
    console.error("ERROR CREAR TEMA:", error);
    res.status(500).json({ error: "Error al crear el tema." });
  }
};

// ============================================================
// PUT /api/temas/:id → Actualizar tema + imágenes (Cloudinary)
// ============================================================
exports.updateTema = async (req, res) => {
  const { id } = req.params;

  const {
    nombre_tema,
    orden,
    titulo_pregunta,
    historia_introduccion,
    historia_nudo,
    historia_desenlace,
  } = req.body;

  const files = req.files || {};

  try {
    const temaExistente = await prisma.temas.findUnique({
      where: { id: Number(id) },
    });

    if (!temaExistente)
      return res.status(404).json({ error: "Tema no encontrado." });

    const getNewUrl = async (fieldKey, oldUrl) => {
      if (files[fieldKey]) {
        if (oldUrl) {
          const publicId = extractPublicId(oldUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        return files[fieldKey][0].path;
      }
      return oldUrl;
    };

    const [imgInicio, imgNudo, imgDesenlace] = await Promise.all([
      getNewUrl("imagen_inicio", temaExistente.url_imagen_inicio),
      getNewUrl("imagen_nudo", temaExistente.url_imagen_nudo),
      getNewUrl("imagen_desenlace", temaExistente.url_imagen_desenlace),
    ]);

    const actualizado = await prisma.temas.update({
      where: { id: Number(id) },
      data: {
        nombre_tema,
        orden: orden ? Number(orden) : undefined,
        titulo_pregunta,
        historia_introduccion,
        historia_nudo,
        historia_desenlace,
        url_imagen_inicio: imgInicio,
        url_imagen_nudo: imgNudo,
        url_imagen_desenlace: imgDesenlace,
      },
    });

    res.json(actualizado);
  } catch (error) {
    console.error("ERROR UPDATE TEMA:", error);
    res.status(500).json({ error: "Error al actualizar tema." });
  }
};

// ============================================================
// DELETE /api/temas/:id → Eliminar tema + imágenes (Cloudinary)
// ============================================================
exports.deleteTema = async (req, res) => {
  const { id } = req.params;

  try {
    const tema = await prisma.temas.findUnique({
      where: { id: Number(id) },
    });

    if (tema) {
      const urls = [
        tema.url_imagen_inicio,
        tema.url_imagen_nudo,
        tema.url_imagen_desenlace,
      ];

      await Promise.all(
        urls.map(async (url) => {
          if (!url) return;
          const publicId = extractPublicId(url);
          if (publicId) await cloudinary.uploader.destroy(publicId);
        })
      );
    }

    await prisma.temas.delete({ where: { id: Number(id) } });

    res.json({ message: "Tema eliminado." });
  } catch (error) {
    console.error("ERROR DELETE TEMA:", error);
    res.status(500).json({
      error: "Error al eliminar tema (posiblemente tiene lecciones asociadas).",
    });
  }
};

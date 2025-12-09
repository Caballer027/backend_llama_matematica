// ============================================================================
// src/controllers/tiendaController.js — VERSIÓN CLOUDINARY FINAL
// ============================================================================

const prisma = require('../prismaClient');
const { v2: cloudinary } = require('cloudinary');

// ---------------------------------------------------------------------------
// CONFIG CLOUDINARY
// ---------------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================================================
// 🧩 Extractor del Public ID desde una URL de Cloudinary
// ============================================================================
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  
  const parts = url.split('/');
  const versionIndex = parts.findIndex(p => p.startsWith('v'));
  if (versionIndex === -1) return null;

  const publicIdWithExt = parts.slice(versionIndex + 1).join('/');

  const finalId = 'llama_matematica/' +
    publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

  return finalId;
};

// ============================================================================
// GET /api/tienda/items — PUBLIC / ADMIN
// ============================================================================
exports.getItems = async (req, res) => {
  try {
    const { tipo } = req.query;
    let items;

    if (tipo) {
      items = await prisma.items.findMany({
        where: { tipos_item: { nombre_tipo: tipo } },
        include: { tipos_item: true },
        orderBy: { asset_index: 'asc' }
      });
    } else {
      items = await prisma.items.findMany({
        include: { tipos_item: true },
        orderBy: { asset_index: 'asc' }
      });
    }

    res.json(items);

  } catch (error) {
    console.error("Error al obtener items:", error);
    res.status(500).json({ error: "Error al obtener items de tienda." });
  }
};

// ============================================================================
// GET /api/tienda/tipos — ADMIN
// ============================================================================
exports.getTiposItem = async (req, res) => {
  try {
    const tipos = await prisma.tipos_item.findMany();
    res.json(tipos);
  } catch (error) {
    console.error("Error al obtener tipos:", error);
    res.status(500).json({ error: "Error al obtener tipos." });
  }
};

// ============================================================================
// POST /api/tienda/comprar — ALUMNO
// ============================================================================
exports.comprarItem = async (req, res) => {
  const { itemId } = req.body;
  const usuarioId = BigInt(req.usuario.id);

  if (!itemId) {
    return res.status(400).json({ error: "Se requiere itemId." });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const item = await tx.items.findUnique({
        where: { id: Number(itemId) },
        include: { tipos_item: true }
      });

      const usuario = await tx.usuarios.findUnique({
        where: { id: usuarioId }
      });

      if (!item) throw new Error("Item no encontrado.");
      if (!item.tipos_item) throw new Error("Item sin tipo asociado.");
      if (usuario.gemas < item.costo_gemas) throw new Error("No tienes suficientes gemas.");

      if (item.tipos_item.nombre_tipo !== "Pista") {
        const yaExiste = await tx.inventario_usuario.findFirst({
          where: { usuario_id: usuarioId, item_id: item.id }
        });

        if (yaExiste) throw new Error("Ya tienes este item.");

        await tx.inventario_usuario.create({
          data: { usuario_id: usuarioId, item_id: item.id }
        });
      }

      const usuarioAct = await tx.usuarios.update({
        where: { id: usuarioId },
        data: { gemas: { decrement: item.costo_gemas } }
      });

      return { gemasRestantes: usuarioAct.gemas };
    });

    res.json({ message: "¡Compra exitosa!", ...resultado });

  } catch (error) {
    console.error("Error al comprar:", error);
    res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// 🧠 HELPER: Procesar archivos dinámicos (Cloudinary)
// ============================================================================
const procesarArchivos = (files, body, itemActual = null) => {
  let icono = null;

  const equipado = itemActual
    ? { ...itemActual.url_imagenes_equipado }
    : {};

  files.forEach(file => {
    const url = file.path; // URL completa de Cloudinary

    if (file.fieldname === 'icono' || file.fieldname === 'imagen') {
      icono = url;
    } else if (file.fieldname.startsWith('img_')) {
      const key = file.fieldname.replace('img_', '').toUpperCase();
      equipado[key] = url;
    }
  });

  const finalIcono =
    icono || (itemActual ? itemActual.url_icono_tienda : null);

  return { finalIcono, finalEquipado: equipado };
};

// ============================================================================
// CREATE ITEM — CLOUDINARY
// ============================================================================
exports.createItem = async (req, res) => {
  const { nombre_item, costo_gemas, tipo_item_id, asset_index, descripcion } = req.body;

  if (!nombre_item || !costo_gemas || !tipo_item_id) {
    return res.status(400).json({ error: "Datos incompletos." });
  }

  try {
    const { finalIcono, finalEquipado } =
      procesarArchivos(req.files || [], req.body);

    if (Object.keys(finalEquipado).length === 0 && finalIcono) {
      finalEquipado['DEFAULT'] = finalIcono;
    }

    const nuevo = await prisma.items.create({
      data: {
        nombre_item,
        descripcion,
        costo_gemas: Number(costo_gemas),
        tipo_item_id: Number(tipo_item_id),
        asset_index: Number(asset_index) || 0,
        url_icono_tienda: finalIcono,
        url_imagenes_equipado: finalEquipado
      }
    });

    res.status(201).json(nuevo);

  } catch (error) {
    console.error("Error al crear item:", error);
    res.status(500).json({ error: "Error al crear item." });
  }
};

// ============================================================================
// UPDATE ITEM — CLOUDINARY
// ============================================================================
exports.updateItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await prisma.items.findUnique({
      where: { id: Number(id) }
    });
    if (!item) return res.status(404).json({ error: "No encontrado." });

    const {
      nombre_item,
      descripcion,
      costo_gemas,
      tipo_item_id,
      asset_index
    } = req.body;

    const { finalIcono, finalEquipado } =
      procesarArchivos(req.files || [], req.body, item);

    const actualizado = await prisma.items.update({
      where: { id: Number(id) },
      data: {
        nombre_item: nombre_item ?? item.nombre_item,
        descripcion: descripcion ?? item.descripcion,
        costo_gemas: costo_gemas ? Number(costo_gemas) : item.costo_gemas,
        asset_index: asset_index ? Number(asset_index) : item.asset_index,
        tipo_item_id: tipo_item_id ? Number(tipo_item_id) : item.tipo_item_id,
        url_icono_tienda: finalIcono,
        url_imagenes_equipado: finalEquipado
      }
    });

    res.json({ message: "Actualizado", item: actualizado });

  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ error: "Error al actualizar." });
  }
};

// ============================================================================
// DELETE ITEM — CLOUDINARY
// ============================================================================
exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await prisma.items.findUnique({
      where: { id: Number(id) }
    });
    if (!item) return res.status(404).json({ error: "No encontrado." });

    const deleteCloudinaryFile = async (url) => {
      if (!url) return;
      const publicId = extractPublicId(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error("Error borrando Cloudinary:", e);
        }
      }
    };

    // borrar icono
    await deleteCloudinaryFile(item.url_icono_tienda);

    // borrar ropa
    if (item.url_imagenes_equipado) {
      const deletePromises =
        Object.values(item.url_imagenes_equipado).map(deleteCloudinaryFile);
      await Promise.all(deletePromises);
    }

    await prisma.items.delete({ where: { id: Number(id) } });

    res.json({ message: "Item eliminado" });

  } catch (error) {
    console.error("Error deleteItem:", error);
    res.status(500).json({ error: "Error al eliminar item." });
  }
};

// ============================================================================
// TIPOS — CRUD
// ============================================================================
exports.createTipo = async (req, res) => {
  const { nombre_tipo } = req.body;
  if (!nombre_tipo) return res.status(400).json({ error: 'Nombre requerido' });

  try {
    const nuevo = await prisma.tipos_item.create({ data: { nombre_tipo } });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tipo.' });
  }
};

exports.updateTipo = async (req, res) => {
  const { id } = req.params;
  const { nombre_tipo } = req.body;

  try {
    const up = await prisma.tipos_item.update({
      where: { id: Number(id) },
      data: { nombre_tipo }
    });
    res.json(up);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
};

exports.deleteTipo = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tipos_item.delete({ where: { id: Number(id) } });
    res.json({ message: 'Tipo eliminado' });

  } catch (error) {
    res.status(400).json({ error: 'No se puede eliminar: Hay items usando este tipo.' });
  }
};

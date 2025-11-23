// src/controllers/tiendaController.js (VERSIÓN 3.0)
const prisma = require('../prismaClient');

// ============================================================
// GET /api/tienda/items
// ¡ACTUALIZADO! Para seleccionar solo los campos necesarios
// ============================================================
exports.getItems = async (req, res) => {
  try {
    // 1. Buscamos el ID del tipo de item "Ropa (Polos)"
    const tipoRopa = await prisma.tipos_item.findUnique({
      where: { nombre_tipo: "Ropa (Polos)" }
    });

    if (!tipoRopa) {
      return res.status(404).json({ error: "Categoría de ropa no encontrada. Revisa el seed." });
    }

    // 2. Buscamos todos los items que sean de ese tipo
    const items = await prisma.items.findMany({
      where: { tipo_item_id: tipoRopa.id },
      select: {
        id: true,
        nombre_item: true,
        costo_gemas: true,
        asset_index: true,
        url_icono_tienda: true, // La URL del polo (ej. polo_1.png)
        url_imagenes_equipado: true // El JSON con las 3 URLs
      },
      orderBy: { asset_index: 'asc' } // Ordena 1, 2, 3...
    });
    
    res.json(items);

  } catch (error) {
    console.error("Error al obtener items:", error);
    res.status(500).json({ error: 'Error al obtener los items de la tienda.' });
  }
};

// ============================================================
// POST /api/tienda/comprar
// ¡ACTUALIZADO! Para usar req.body y manejar "Ropa (Polos)"
// ============================================================
exports.comprarItem = async (req, res) => {
  const { itemId } = req.body; // <-- CAMBIO: Usamos req.body (JSON)
  const usuarioId = BigInt(req.usuario.id);

  if (!itemId) {
    return res.status(400).json({ error: 'Se requiere el itemId.' });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtener el item y el usuario
      const item = await tx.items.findUnique({ 
        where: { id: Number(itemId) },
        include: { tipos_item: true } // Incluimos el tipo
      });
      const usuario = await tx.usuarios.findUnique({ where: { id: usuarioId } });

      if (!item) throw new Error('Item no encontrado.');
      if (!item.tipos_item) throw new Error('Item con tipo inválido.');

      // 2. Verificar si el usuario tiene gemas
      if (usuario.gemas < item.costo_gemas) {
        throw new Error('No tienes suficientes gemas.');
      }

      // 3. Lógica para ROPA (Polos)
      if (item.tipos_item.nombre_tipo === 'Ropa (Polos)') {
        
        // Verificar si ya lo posee en el inventario
        const itemExistente = await tx.inventario_usuario.findFirst({
          where: { usuario_id: usuarioId, item_id: item.id }
        });
        if (itemExistente) throw new Error('Ya posees este item en tu inventario.');

        // Añadir al inventario (armario)
        await tx.inventario_usuario.create({
          data: { usuario_id: usuarioId, item_id: item.id },
        });

      } 
      // 4. Lógica para otros tipos (ej: Consumibles)
      else if (item.tipos_item.nombre_tipo === 'Pista') {
        // (Tu lógica de pistas aquí)
        console.log("Usuario compró un consumible");
      } 
      else {
        throw new Error('Tipo de item no comprable.');
      }

      // 5. Descontar gemas
      const usuarioActualizado = await tx.usuarios.update({
        where: { id: usuarioId },
        data: { gemas: { decrement: item.costo_gemas } },
      });

      return { gemasRestantes: usuarioActualizado.gemas };
    });

    res.json({ message: '¡Compra exitosa!', ...resultado });

  } catch (error) {
    console.error("Error al comprar item:", error);
    res.status(400).json({ error: error.message });
  }
};
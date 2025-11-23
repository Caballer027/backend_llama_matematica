const prisma = require('../prismaClient');

// ============================================================
// POST /api/inventario/equipar
// ============================================================
const equiparItem = async (req, res) => {
    const usuarioId = BigInt(req.usuario.id);
    const { itemId } = req.body; 

    if (!itemId) {
        return res.status(400).json({ error: 'El ID del item es requerido.' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Verificar que el usuario POSEE este item
            const itemEnInventario = await tx.inventario_usuario.findFirst({
                where: { usuario_id: usuarioId, item_id: itemId },
            });

            if (!itemEnInventario) {
                throw new Error('No posees este item en tu inventario.'); 
            }

            // 2. Obtener el "Slot" (tipo_item_id) del item
            const item = await tx.items.findUnique({
                where: { id: itemId },
                select: { tipo_item_id: true, nombre_item: true }, 
            });

            if (!item) {
                throw new Error('El item no existe.');
            }

            const slotId = item.tipo_item_id;

            // 3. Equipar el item usando "upsert" y el @@unique correcto
            await tx.equipo_usuario.upsert({
                where: {
                    // CORRECCIÓN: Usamos el @@unique de tu schema
                    usuario_id_tipo_item_id: { 
                        usuario_id: usuarioId,
                        tipo_item_id: slotId,
                    },
                },
                update: {
                    item_id: itemId, // Actualiza al nuevo item
                },
                create: {
                    usuario_id: usuarioId,
                    tipo_item_id: slotId,
                    item_id: itemId, // Crea la entrada con el nuevo item
                },
            });
        });

        res.json({ message: '¡Item equipado con éxito!' });

    } catch (error) {
        let statusCode = 400;
        if (error.message.includes('No posees')) statusCode = 403;

        console.error('❌ Error al equipar item:', error.message);
        res.status(statusCode).json({ error: error.message });
    }
};

// ============================================================
// POST /api/inventario/desequipar
// ============================================================
const desequiparItem = async (req, res) => {
    const usuarioId = BigInt(req.usuario.id);
    // CORRECCIÓN: Necesitamos el slotId (tipo_item_id) para desequipar
    const { slotId } = req.body; 

    if (!slotId) {
        return res.status(400).json({ error: 'El ID del slot (tipo_item_id) es requerido.' });
    }

    try {
        // CORRECCIÓN: Usamos delete con el @@unique correcto
        await prisma.equipo_usuario.delete({
            where: {
                usuario_id_tipo_item_id: {
                    usuario_id: usuarioId,
                    tipo_item_id: Number(slotId), // Aseguramos que sea número
                },
            },
        });

        res.json({ message: 'Item desequipado con éxito.' });

    } catch (error) {
        if (error.code === 'P2025') { // Si no había nada que borrar
            return res.json({ message: 'No había nada equipado en ese slot.' });
        }
        console.error('❌ Error al desequipar item:', error);
        res.status(500).json({ error: 'No se pudo desequipar el item.' });
    }
};

// ============================================================
// GET /api/inventario/equipo/activo
// ============================================================
const getEquipoActivo = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id);

  try {
    const data = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: {
        nombre_personaje_usuario: true,
        personaje_activo: {
          select: {
            asset_key: true,
            url_imagen_base: true,
            nombre: true, 
            mensaje_corta: true,
            mensaje_larga: true,
          }
        },
        // CORRECCIÓN: Usamos el nombre de relación 'equipo' (del log de error)
        equipo: { 
          select: {
            // CORRECCIÓN: Seleccionamos el 'item' directamente (no 'item_cuerpo')
            items: { 
              select: {
                id: true,
                nombre_item: true,
                url_imagenes_equipado: true,
                tipo_item_id: true,
              }
            }
          }
        }
      }
    });

    if (!data || !data.personaje_activo) {
      return res.status(404).json({ error: 'Datos de usuario o personaje activo no encontrados.' });
    }
    
    // --- LÓGICA DE FILTRADO PARA ENCONTRAR EL POLO ---
    let urlImagenFinal = data.personaje_activo.url_imagen_base;
    let itemEquipado = null;

    // Buscamos el ID del tipo de item "Ropa (Polos)"
    // (Esto debería estar en cache, pero por ahora lo buscamos)
    const tipoRopa = await prisma.tipos_item.findUnique({
      where: { nombre_tipo: "Ropa (Polos)" }
    });
    const TIPO_ROPA_ID = tipoRopa ? tipoRopa.id : -1;

    // 'data.equipo' es una LISTA de items equipados (sombrero, polo, etc.)
    if (data.equipo && data.equipo.length > 0) {
      
      // Buscamos en la lista el item que coincida con el TIPO_ROPA_ID
      const poloEquipado = data.equipo.find(e => e.items.tipo_item_id === TIPO_ROPA_ID);

      if (poloEquipado) {
        itemEquipado = poloEquipado.items;
        const personajeKey = data.personaje_activo.asset_key;

        if (itemEquipado.url_imagenes_equipado && itemEquipado.url_imagenes_equipado[personajeKey]) {
          urlImagenFinal = itemEquipado.url_imagenes_equipado[personajeKey];
        }
      }
    }
    
    res.json({
        nombre_personalizado: data.nombre_personaje_usuario || data.personaje_activo.nombre, 
        personaje_base: data.personaje_activo.nombre,
        personaje_key: data.personaje_activo.asset_key,
        url_avatar_actual: urlImagenFinal,
        mensajes: {
            corta: data.personaje_activo.mensaje_corta,
            larga: data.personaje_activo.mensaje_larga,
        },
        item_equipado: itemEquipado, // Devolverá el polo o null
    });

  } catch (error) {
    console.error('❌ Error al obtener el equipo activo:', error.message);
    res.status(500).json({ error: 'Error al obtener el equipo activo.' });
  }
};


// Exportamos las funciones
module.exports = {
    equiparItem,
    desequiparItem,
    getEquipoActivo,
};
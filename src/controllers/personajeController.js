// src/controllers/personajeController.js (V4.1 - CORREGIDO)
const prisma = require('../prismaClient');

// GET /api/personajes
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

// POST /api/personajes/seleccionar
exports.seleccionarPersonaje = async (req, res) => {
  const usuarioId = BigInt(req.usuario.id); 
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
      error: 'Error interno del servidor al seleccionar personaje' 
    });
  }
};
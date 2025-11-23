// src/middleware/adminMiddleware.js
const prisma = require('../prismaClient');

const adminMiddleware = async (req, res, next) => {
  try {
    // El authMiddleware ya nos dio el ID del usuario en req.usuario
    const usuarioId = BigInt(req.usuario.id);

    // ✅ CORRECCIÓN: la relación se llama "rol" (singular)
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: {
        rol: {
          select: { nombre_rol: true },
        },
      },
    });

    // ✅ Verificación
    if (usuario && usuario.rol && usuario.rol.nombre_rol === 'Administrador') {
      next(); // ✅ Es admin → puede continuar
    } else {
      res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
  } catch (error) {
    console.error('❌ Error en adminMiddleware:', error);
    res.status(500).json({ error: 'Error del servidor al verificar permisos.' });
  }
};

module.exports = adminMiddleware;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.usuario || !req.usuario.id) return res.status(401).json({ error: 'Token inválido.' });

    const user = await prisma.usuarios.findUnique({
      where: { id: BigInt(req.usuario.id) },
      include: { rol: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    if (user.rol.nombre_rol !== 'Administrador') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere ser Administrador.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error de servidor.' });
  }
};

exports.isTeacherOrAdmin = async (req, res, next) => {
  try {
    if (!req.usuario || !req.usuario.id) return res.status(401).json({ error: 'Token inválido.' });

    const user = await prisma.usuarios.findUnique({
      where: { id: BigInt(req.usuario.id) },
      include: { rol: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const permitidos = ['Administrador', 'Profesor'];
    if (!permitidos.includes(user.rol.nombre_rol)) {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error de servidor.' });
  }
};
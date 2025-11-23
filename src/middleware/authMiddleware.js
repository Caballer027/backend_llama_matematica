// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // 1. Obtener el token del header de la petición
  const authHeader = req.header('Authorization');

  // 2. Verificar si no hay token
  if (!authHeader) {
    return res.status(401).json({ error: 'No hay token, permiso denegado.' });
  }

  try {
    // El token viene en formato "Bearer <token>", lo separamos
    const token = authHeader.split(' ')[1];

    // 3. Verificar la validez del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Añadir el payload del token (los datos del usuario) al objeto request
    req.usuario = decoded.usuario;

    // 5. Dejar que la petición continúe hacia la ruta final
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token no es válido.' });
  }
};
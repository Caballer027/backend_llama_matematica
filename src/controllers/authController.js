// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================================
// Función auxiliar para generar Token (DRY)
// ============================================================
const generarToken = (id, rol_id) => {
  return jwt.sign(
    { usuario: { id: id.toString(), rol: rol_id } },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// ============================================================
// 1. REGISTRO MANUAL
// ============================================================
exports.register = async (req, res) => {
  const { 
    nombre, 
    apellido, 
    correo_electronico, 
    contrasena, 
    fecha_nacimiento, 
    carrera_id, 
    ano_ingreso, 
    ciclo_actual_id 
  } = req.body;

  if (!correo_electronico || !contrasena || !nombre || !ano_ingreso || !carrera_id || !ciclo_actual_id) {
    return res.status(400).json({
      error: 'Faltan campos requeridos.'
    });
  }

  try {
    if (!correo_electronico.endsWith('@tecsup.edu.pe')) {
      return res.status(400).json({ error: 'Solo se permiten correos de Tecsup.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash_contrasena = await bcrypt.hash(contrasena, salt);

    const rolEstudiante = await prisma.roles.findUnique({ where: { nombre_rol: 'Estudiante' } });
    const tecsup = await prisma.institucion.findUnique({ where: { nombre: 'Tecsup' } });

    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre,
        apellido,
        correo_electronico,
        hash_contrasena,
        fecha_nacimiento: new Date(fecha_nacimiento),
        carrera_id: Number(carrera_id),
        ano_ingreso: Number(ano_ingreso),
        ciclo_actual_id: Number(ciclo_actual_id),
        rol_id: rolEstudiante.id,
        institucion_id: tecsup.id,
        personaje_activo_id: 1
      },
    });

    const usuarioParaRespuesta = {
      ...nuevoUsuario,
      id: nuevoUsuario.id.toString()
    };
    delete usuarioParaRespuesta.hash_contrasena;

    res.status(201).json({ 
      message: '¡Usuario registrado con éxito!', 
      usuario: usuarioParaRespuesta 
    });

  } catch (error) {
    console.error('ERROR EN REGISTRO:', error);

    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este correo electrónico ya está registrado.' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'El ID de carrera o ID de ciclo no es válido.' });
    }

    res.status(500).json({ error: 'Error interno al registrar el usuario.' });
  }
};

// ============================================================
// 2. LOGIN TRADICIONAL (Corregido con retorno de usuario completo)
// ============================================================
exports.login = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ error: 'Faltan el correo electrónico o la contraseña.' });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { correo_electronico }
    });

    if (!usuario || !usuario.hash_contrasena) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const esContraseñaValida = await bcrypt.compare(contrasena, usuario.hash_contrasena);

    if (!esContraseñaValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar Token
    const token = generarToken(usuario.id, usuario.rol_id);

    // *** CORRECCIÓN AQUÍ → retornar usuario ***
    res.json({
      message: '¡Inicio de sesión exitoso!',
      token,
      usuario: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.correo_electronico,
        rol: usuario.rol_id
      },
      rol: usuario.rol_id
    });

  } catch (error) {
    console.error('ERROR EN LOGIN:', error);
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
};

// ============================================================
// 3. LOGIN CON GOOGLE
// ============================================================
exports.googleLogin = async (req, res) => {
  const { email, displayName, photoUrl } = req.body;

  if (!email) return res.status(400).json({ error: 'Falta el email de Google.' });

  try {
    // Buscar si ya existe
    let usuario = await prisma.usuarios.findUnique({
      where: { correo_electronico: email }
    });

    // Si no existe → crear usuario básico
    if (!usuario) {
      const rolEstudiante = await prisma.roles.findUnique({ where: { nombre_rol: 'Estudiante' } });
      const tecsup = await prisma.institucion.findUnique({ where: { nombre: 'Tecsup' } });

      const partes = displayName ? displayName.split(' ') : ['Usuario', 'Google'];
      const apellido = partes.length > 1 ? partes.pop() : '';
      const nombre = partes.join(' ');

      usuario = await prisma.usuarios.create({
        data: {
          nombre,
          apellido,
          correo_electronico: email,
          rol_id: rolEstudiante.id,
          institucion_id: tecsup ? tecsup.id : undefined,
          personaje_activo_id: 1,
          gemas: 0,
          puntos_experiencia: 0
        }
      });
    }

    // Generar Token
    const token = generarToken(usuario.id, usuario.rol_id);

    res.json({
      message: 'Login Google exitoso',
      token,
      usuario: {
        id: usuario.id.toString(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.correo_electronico,
        rol: usuario.rol_id,
        es_nuevo: usuario.carrera_id == null
      }
    });

  } catch (error) {
    console.error('ERROR GOOGLE LOGIN:', error);
    res.status(500).json({ error: 'Error al procesar login con Google.' });
  }
};

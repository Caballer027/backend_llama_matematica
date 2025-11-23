// src/controllers/authController.js (VERSIÓN ACTUALIZADA CON CICLOS)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRO DE USUARIO ---
exports.register = async (req, res) => {
  // --- CAMBIO: Añadido 'ciclo_actual_id' ---
  const { nombre, apellido, correo_electronico, contrasena, fecha_nacimiento, carrera_id, ano_ingreso, ciclo_actual_id } = req.body;

  // --- CAMBIO: Añadido a la validación ---
  if (!correo_electronico || !contrasena || !nombre || !ano_ingreso || !carrera_id || !ciclo_actual_id) {
    return res.status(400).json({
      error: 'Faltan campos requeridos. Revisa que las claves en Postman sean correctas (nombre, correo, contrasena, ano_ingreso, carrera_id, ciclo_actual_id).'
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
        ciclo_actual_id: Number(ciclo_actual_id), // --- CAMBIO: Guardamos el ciclo ---
        rol_id: rolEstudiante.id,
        institucion_id: tecsup.id,
      },
    });

    // --- CORRECCIÓN FINAL PARA EL ERROR 'BigInt' ---
    const usuarioParaRespuesta = {
      ...nuevoUsuario,
      id: nuevoUsuario.id.toString(), // Convertimos el BigInt a un string
    };
    delete usuarioParaRespuesta.hash_contrasena;

    res.status(201).json({ message: '¡Usuario registrado con éxito!', usuario: usuarioParaRespuesta });

  } catch (error) {
    console.error('ERROR EN REGISTRO:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este correo electrónico ya está registrado.' });
    }
    // Error si el ciclo_actual_id o carrera_id no existen
    if (error.code === 'P2003') { 
      return res.status(400).json({ error: 'El ID de carrera o ID de ciclo no es válido.' });
    }
    res.status(500).json({ error: 'Error interno al registrar el usuario.' });
  }
};


// --- LOGIN DE USUARIO (Sin cambios) ---
exports.login = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ error: 'Faltan el correo electrónico o la contraseña.' });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { correo_electronico },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const esContraseñaValida = await bcrypt.compare(contrasena, usuario.hash_contrasena);

    if (!esContraseñaValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const payload = {
      usuario: {
        id: usuario.id.toString(), // También convertimos aquí
        rol: usuario.rol_id
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (error, token) => {
        if (error) throw error;
        res.json({ message: '¡Inicio de sesión exitoso!', token });
      }
    );

  } catch (error) {
    console.error('ERROR EN LOGIN:', error);
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
};
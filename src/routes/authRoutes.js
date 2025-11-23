const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para el registro e inicio de sesión de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     description: Crea una nueva cuenta de estudiante. Solo se permiten correos @tecsup.edu.pe.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *                 example: juan.perez@tecsup.edu.pe
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "2004-03-27"
 *               carrera_id:
 *                 type: integer
 *                 description: ID numérico de la carrera.
 *                 example: 2
 *               ano_ingreso:
 *                 type: integer
 *                 example: 2025
 *               ciclo_actual_id:
 *                 type: integer
 *                 description: ID numérico del ciclo actual (ej. 1 para "Primer ciclo").
 *                 example: 1
 *     responses:
 *       '201':
 *         description: Usuario registrado exitosamente. Devuelve el objeto del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Usuario registrado con éxito!"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     nombre:
 *                       type: string
 *                       example: "Juan"
 *                     apellido:
 *                       type: string
 *                       example: "Pérez"
 *                     correo_electronico:
 *                       type: string
 *                       example: "juan.perez@tecsup.edu.pe"
 *                     fecha_nacimiento:
 *                       type: string
 *                       format: date
 *                       example: "2004-03-27"
 *                     carrera_id:
 *                       type: integer
 *                       example: 2
 *                     ano_ingreso:
 *                       type: integer
 *                       example: 2025
 *                     ciclo_actual_id:
 *                       type: integer
 *                       example: 1
 *       '400':
 *         description: Datos inválidos, campos faltantes (incluyendo carrera_id o ciclo_actual_id) o correo no permitido.
 *       '409':
 *         description: Conflicto. Este correo electrónico ya está registrado.
 *       '500':
 *         description: Error interno del servidor.
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Autenticación]
 *     description: Autentica a un usuario con correo y contraseña, y devuelve un token JWT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 format: email
 *                 example: juan.perez@tecsup.edu.pe
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       '200':
 *         description: Inicio de sesión exitoso. Devuelve un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Inicio de sesión exitoso!"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       '401':
 *         description: Credenciales incorrectas.
 */
router.post('/login', authController.login);

module.exports = router;

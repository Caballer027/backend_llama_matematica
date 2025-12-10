// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para el registro y autenticación de usuarios
 */

// ============================================================
// 1. REGISTRO MANUAL
// ============================================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario (Manual)
 *     tags: [Autenticación]
 *     description: |
 *       Crea una nueva cuenta de estudiante usando correo institucional **@tecsup.edu.pe**
 *       * Los campos carrera_id y ciclo_actual_id son obligatorios en el registro manual.
 *       * El campo ano_ingreso es opcional (se asume el año actual si no se envía).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo_electronico
 *               - contrasena
 *               - carrera_id
 *               - ciclo_actual_id
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
 *                 example: 2
 *               ano_ingreso:
 *                 type: integer
 *                 description: Opcional. Si no se envía, se usa el año actual.
 *                 example: 2025
 *               ciclo_actual_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       '201':
 *         description: Usuario registrado exitosamente.
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
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     correo_electronico:
 *                       type: string
 *                     carrera_id:
 *                       type: integer
 *                     ciclo_actual_id:
 *                       type: integer
 *       '400':
 *         description: Faltan campos obligatorios o correo inválido.
 *       '409':
 *         description: El correo ya existe.
 *       '500':
 *         description: Error interno del servidor.
 */
router.post('/register', authController.register);

// ============================================================
// 2. LOGIN TRADICIONAL
// ============================================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicio de sesión tradicional (correo + contraseña)
 *     tags: [Autenticación]
 *     description: Autentica al usuario y devuelve un token JWT válido por 30 días.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo_electronico
 *               - contrasena
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 example: juan.perez@tecsup.edu.pe
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       '200':
 *         description: Inicio de sesión exitoso.
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
 *       '401':
 *         description: Credenciales incorrectas.
 *       '500':
 *         description: Error interno del servidor.
 */
router.post('/login', authController.login);

// ============================================================
// 3. LOGIN/REGISTRO CON GOOGLE
// ============================================================

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login/Registro con Google (para App Móvil)
 *     tags: [Autenticación]
 *     description: |
 *       - Verifica si el correo existe en la base de datos
 *       - Si no existe, **crea automáticamente un usuario sin contraseña**
 *       - Asigna automáticamente el rol Estudiante
 *       - Devuelve un token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan.perez@tecsup.edu.pe"
 *               displayName:
 *                 type: string
 *                 example: "Juan Pérez"
 *               photoUrl:
 *                 type: string
 *                 example: "https://lh3.googleusercontent.com/photo.jpg"
 *     responses:
 *       '200':
 *         description: Login Google exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login Google exitoso"
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     rol_id:
 *                       type: integer
 *                     es_nuevo:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Falta email.
 *       '500':
 *         description: Error al procesar autenticación con Google.
 */
router.post('/google', authController.googleLogin);

module.exports = router;
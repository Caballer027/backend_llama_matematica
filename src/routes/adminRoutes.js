// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ============================================================
// 📘 TAG SWAGGER
// ============================================================
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints para la gestión de usuarios (Requiere rol de Administrador).
 */

// ============================================================
// 🧱 MIDDLEWARES DE SEGURIDAD
// ============================================================
// Todas las rutas aquí requieren token válido y rol de administrador
router.use(authMiddleware, adminMiddleware);

// ============================================================
// ✅ GET /api/admin/usuarios
// ============================================================
/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios (Solo Admin)
 *     tags: [Admin]
 *     description: Devuelve un array con los datos principales de todos los usuarios registrados en la plataforma.
 *     security:
 *       - bearerAuth: []  # Requiere token de administrador
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   nombre:
 *                     type: string
 *                     example: "Juan"
 *                   apellido:
 *                     type: string
 *                     example: "Pérez"
 *                   correo_electronico:
 *                     type: string
 *                     example: "juan.perez@tecsup.edu.pe"
 *                   puntos_experiencia:
 *                     type: integer
 *                     example: 1500
 *                   gemas:
 *                     type: integer
 *                     example: 250
 *                   rol:
 *                     type: string
 *                     example: "Estudiante"
 *       401:
 *         description: No autorizado (token ausente o inválido).
 *       403:
 *         description: Prohibido (el usuario no es administrador).
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuarios', adminController.getAllUsers);

// ============================================================
// ✅ GET /api/admin/usuarios/:id
// ============================================================
/**
 * @swagger
 * /admin/usuarios/{id}:
 *   get:
 *     summary: Obtiene el perfil detallado de un usuario (Solo Admin)
 *     tags: [Admin]
 *     description: Devuelve el perfil completo de un usuario, incluyendo su historial de progreso, personaje activo y datos académicos.
 *     security:
 *       - bearerAuth: []  # Requiere token de administrador
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario (convertido a string en la respuesta)
 *         example: "1"
 *     responses:
 *       200:
 *         description: Perfil detallado del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 nombre:
 *                   type: string
 *                   example: "Juan"
 *                 apellido:
 *                   type: string
 *                   example: "Pérez"
 *                 correo_electronico:
 *                   type: string
 *                   example: "juan.perez@tecsup.edu.pe"
 *                 fecha_nacimiento:
 *                   type: string
 *                   format: date
 *                   example: "2004-03-27"
 *                 ano_ingreso:
 *                   type: integer
 *                   example: 2025
 *                 puntos_experiencia:
 *                   type: integer
 *                   example: 1500
 *                 gemas:
 *                   type: integer
 *                   example: 250
 *                 rol:
 *                   type: string
 *                   example: "Estudiante"
 *                 institucion:
 *                   type: string
 *                   example: "Tecsup"
 *                 carrera:
 *                   type: string
 *                   example: "Diseño y Desarrollo de Software"
 *                 personaje_activo:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Khipu"
 *                     asset_key:
 *                       type: string
 *                       example: "khipu_default"
 *                 historial_progreso:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       leccion:
 *                         type: string
 *                         example: "Introducción a las Variables"
 *                       estado:
 *                         type: string
 *                         example: "completado"
 *                       puntaje_total:
 *                         type: integer
 *                         example: 95
 *                       intentos:
 *                         type: integer
 *                         example: 2
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido (no es administrador).
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/usuarios/:id', adminController.getUserById);

module.exports = router;

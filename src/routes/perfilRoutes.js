// ============================================================
// src/routes/perfilRoutes.js
// ============================================================
const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Perfil
 *   description: Gestión del perfil del usuario autenticado.
 */

// Middleware global para autenticación
router.use(authMiddleware);

// ============================================================
// GET /api/perfil/me
// ============================================================
/**
 * @swagger
 * /perfil/me:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Perfil]
 *     description: Retorna los datos personales, carrera, institución, rol, gemas y puntos de experiencia del usuario autenticado, junto con su personaje activo.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido con éxito.
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
 *                   example: "Leo"
 *                 apellido:
 *                   type: string
 *                   example: "Caballero"
 *                 correo_electronico:
 *                   type: string
 *                   example: "leo.caballero@tecsup.edu.pe"
 *                 rol:
 *                   type: string
 *                   example: "Estudiante"
 *                 institucion:
 *                   type: string
 *                   example: "Tecsup"
 *                 carrera:
 *                   type: string
 *                   example: "Diseño y Desarrollo de Software"
 *                 gemas:
 *                   type: integer
 *                   example: 1200
 *                 puntos_experiencia:
 *                   type: integer
 *                   example: 3500
 *                 personaje_activo:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Khipu"
 *       401:
 *         description: No autorizado o token inválido.
 *       404:
 *         description: Perfil no encontrado.
 */
router.get('/me', perfilController.obtenerMiPerfil);

module.exports = router;

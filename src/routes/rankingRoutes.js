const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Rankings
 *   description: Endpoints para obtener rankings por lección, instituto y carrera, incluyendo el puesto de cada usuario.
 */

// Middleware de autenticación
router.use(authMiddleware);

// ============================================================
// GET /api/ranking/instituto/:idInstituto
// ============================================================
/**
 * @swagger
 * /ranking/instituto/{idInstituto}:
 *   get:
 *     summary: Obtiene el ranking general de un instituto
 *     tags: [Rankings]
 *     description: Devuelve todos los usuarios de un instituto con su puesto, carrera y total de puntos de experiencia acumulados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idInstituto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del instituto.
 *     responses:
 *       '200':
 *         description: Ranking del instituto obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   puesto:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: "Carlos"
 *                   apellido:
 *                     type: string
 *                     example: "Rojas"
 *                   carrera:
 *                     type: string
 *                     example: "Ingeniería de Software"
 *                   total_experiencia:
 *                     type: integer
 *                     example: 850
 */
router.get('/instituto/:idInstituto', rankingController.getRankingByInstituto);

// ============================================================
// GET /api/ranking/carrera/:idCarrera
// ============================================================
/**
 * @swagger
 * /ranking/carrera/{idCarrera}:
 *   get:
 *     summary: Obtiene el ranking general de una carrera
 *     tags: [Rankings]
 *     description: Devuelve todos los usuarios de una carrera con su puesto y puntos de experiencia acumulados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCarrera
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carrera.
 *     responses:
 *       '200':
 *         description: Ranking por carrera obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   puesto:
 *                     type: integer
 *                     example: 2
 *                   nombre:
 *                     type: string
 *                     example: "Lucía"
 *                   apellido:
 *                     type: string
 *                     example: "Mendoza"
 *                   total_experiencia:
 *                     type: integer
 *                     example: 920
 */
router.get('/carrera/:idCarrera', rankingController.getRankingByCarrera);

module.exports = router;

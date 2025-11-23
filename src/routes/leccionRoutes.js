// src/routes/leccionRoutes.js
const express = require('express');
const router = express.Router();
const leccionController = require('../controllers/leccionController');
const authMiddleware = require('../middleware/authMiddleware');

// Usamos auth, ya que solo usuarios logueados ven las lecciones
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Lecciones
 *   description: Endpoints para obtener información de lecciones (preguntas y ranking).
 */

// =Sigue=
// GET /api/lecciones/:id (Para obtener las preguntas)
/**
 * @swagger
 * /lecciones/{id}:
 *   get:
 *     summary: Obtiene los detalles y preguntas de una lección
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detalles de la lección.
 */
router.get('/:id', leccionController.getLeccionById);

// ============================================================
// ¡ESTE ES EL ENDPOINT DEL PODIO!
// GET /api/lecciones/:id/ranking 
// ============================================================
/**
 * @swagger
 * /lecciones/{id}/ranking:
 *   get:
 *     summary: Obtiene el Podio Top 10 para una lección
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID de la lección (ej. 1 para la Semana 1)
 *     responses:
 *       '200':
 *         description: Lista del Top 10.
 */
router.get('/:id/ranking', leccionController.getRankingByLeccion);

module.exports = router;
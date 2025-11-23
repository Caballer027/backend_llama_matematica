// src/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const protect = require('../middleware/authMiddleware'); // Usamos 'protect'

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Endpoints para obtener el feedback de la IA post-quiz.
 */

// ===================================================================
// DEFINICIÓN DEL SCHEMA DE SWAGGER (MOVIDO AQUÍ)
// ===================================================================
/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string # CORREGIDO: Los BigInt se envían como string
 *           example: "1"
 *         fecha_generacion:
 *           type: string
 *           format: date-time
 *           example: "2025-11-10T12:37:33.605Z"
 *         resumen:
 *           type: object
 *           properties:
 *             puntosFuertes:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["¡Gran esfuerzo! Se nota que entiendes el planteamiento inicial."]
 *             areasMejora:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["He notado que el principal desafío está en el despeje de variables..."]
 *             consejosPracticos:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Revisa el orden de las operaciones (PEMDAS)"]
 *         errores_detalle:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               enunciado_pregunta:
 *                 type: string
 *                 example: "Ejercicio 3 (Ecuación con paréntesis): 3(2x - 5) = 4x + 1"
 *               analisis:
 *                 type: string
 *                 example: "Aquí, el error común es olvidar distribuir el signo negativo..."
 *               consejo:
 *                 type: string
 *                 example: "Recuerda: ¡un signo puede cambiar todo el resultado!"
 */
// ===================================================================

// Todas las rutas de feedback requieren autenticación
router.use(protect); // Usamos 'protect'

// ===================================================================
// GET /api/feedback/:id
// ===================================================================
/**
 * @swagger
 * /feedback/{id}:
 *   get:
 *     summary: Obtiene un reporte de feedback de la IA por su ID
 *     tags: [Feedback]
 *     description: Devuelve el reporte completo (resumen y errores) para mostrar en la pantalla de "Consejo de IA".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string # CORREGIDO: El ID ahora es un BigInt (enviado como string)
 *         description: El ID del feedback (obtenido de la respuesta de 'quiz/finish').
 *         example: "1"
 *     responses:
 *       '200':
 *         description: Reporte de feedback obtenido con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedbackReport' # <-- ¡Ahora sí lo encontrará!
 *       '404':
 *         description: Feedback no encontrado o no pertenece al usuario.
 */
router.get('/:id', feedbackController.getFeedbackById);

module.exports = router;
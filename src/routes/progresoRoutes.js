// ============================================================
// src/routes/progresoRoutes.js
// ============================================================
const express = require('express');
const router = express.Router();
const progresoController = require('../controllers/progresoController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Progreso
 *   description: Endpoints relacionados con el avance del usuario en las lecciones.
 */

// Middleware global para proteger las rutas
router.use(authMiddleware);

// ============================================================
// GET /api/progreso/leccion/{leccionId}
// ============================================================
/**
 * @swagger
 * /progreso/leccion/{leccionId}:
 *   get:
 *     summary: Obtiene el progreso del usuario en una lección específica
 *     tags: [Progreso]
 *     description: Devuelve el estado, puntaje, experiencia y gemas obtenidas en una lección, junto con la lista de ejercicios.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lección a consultar.
 *     responses:
 *       200:
 *         description: Progreso de la lección obtenido con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leccionTitulo:
 *                   type: string
 *                   example: "Ecuaciones Lineales"
 *                 estado:
 *                   type: string
 *                   enum: [no_iniciado, en_progreso, completado]
 *                   example: "completado"
 *                 puntajeActual:
 *                   type: integer
 *                   example: 20
 *                 puntajeMaximo:
 *                   type: integer
 *                   example: 20
 *                 xpGanada:
 *                   type: integer
 *                   example: 250
 *                 gemasGanadas:
 *                   type: integer
 *                   example: 15
 *                 feedbackId:
 *                   type: string
 *                   nullable: true
 *                   example: "12"
 *                 ejercicios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       titulo:
 *                         type: string
 *                         example: "Ejercicio N° 3"
 *                       estado:
 *                         type: string
 *                         enum: [Incompleto, Completo]
 *                         example: "Completo"
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Lección no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/leccion/:leccionId', progresoController.getProgresoPorLeccion);

// ============================================================
// GET /api/progreso/historial
// ============================================================
/**
 * @swagger
 * /progreso/historial:
 *   get:
 *     summary: Obtiene el historial de intentos de quizzes completados
 *     tags: [Progreso]
 *     description: Devuelve una lista de intentos de quizzes completados por el usuario, incluyendo puntaje, XP, gemas e información de la lección.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de intentos obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   intentoId:
 *                     type: string
 *                     example: "45"
 *                   leccionId:
 *                     type: integer
 *                     example: 7
 *                   tituloLeccion:
 *                     type: string
 *                     example: "Evaluación de SEM1"
 *                   nombreTema:
 *                     type: string
 *                     example: "Ecuaciones Lineales"
 *                   puntaje_total:
 *                     type: integer
 *                     example: 18
 *                   xp_ganada:
 *                     type: integer
 *                     example: 216
 *                   gemas_ganadas:
 *                     type: integer
 *                     example: 12
 *                   intentos_totales:
 *                     type: integer
 *                     description: Número total de intentos para esta lección
 *                     example: 2
 *                   feedbackId:
 *                     type: string
 *                     nullable: true
 *                     example: "8"
 *                   fecha_intento:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/historial', progresoController.getProgresoConFeedback);

module.exports = router;
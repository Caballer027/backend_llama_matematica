// ============================================================
// src/routes/quizRoutes.js
// ============================================================
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const protect = require('../middleware/authMiddleware');

// ============================================================
// SWAGGER: Quiz Interactivo
// ============================================================
/**
 * @swagger
 * tags:
 *   name: Quiz Interactivo
 *   description: Endpoints para gestionar el flujo completo del quiz (inicio, respuesta y finalización).
 */

// Todas las rutas requieren autenticación JWT
router.use(protect);

// ============================================================
// POST /quiz/start
// ============================================================
/**
 * @swagger
 * /quiz/start:
 *   post:
 *     summary: Inicia una nueva sesión de quiz para una lección.
 *     tags: [Quiz Interactivo]
 *     description: >
 *       Crea una sesión de quiz asociada a una lección específica.  
 *       Valida que no exista una sesión activa para el usuario y genera la primera pregunta.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leccionId
 *             properties:
 *               leccionId:
 *                 type: integer
 *                 description: ID de la lección que se desea iniciar.
 *                 example: 1
 *     responses:
 *       '201':
 *         description: Sesión iniciada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: ID de la sesión creada.
 *                   example: "124"
 *                 leccionTitulo:
 *                   type: string
 *                   example: "Fracciones y Decimales"
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-11-11T15:30:00.000Z"
 *                 totalPreguntas:
 *                   type: integer
 *                   example: 10
 *                 primeraPregunta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     enunciado_pregunta:
 *                       type: string
 *                       example: "¿Cuál es el resultado de 1/2 + 1/3?"
 *                     tipo_pregunta:
 *                       type: string
 *                       example: "opcion_multiple"
 *                     pasos_guia:
 *                       type: string
 *                       description: "Guía paso a paso (puede ser string o JSON). Por diseño esta guía es de pago."
 *                       example: "1. Encuentra el denominador común. 2. Suma los numeradores."
 *                     opciones_respuesta:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 12
 *                           texto_respuesta:
 *                             type: string
 *                             example: "5/6"
 *       '400':
 *         description: Ya existe una sesión activa para esta lección.
 *       '404':
 *         description: Lección o preguntas no encontradas.
 *       '500':
 *         description: Error interno al iniciar el quiz.
 */
router.post('/start', quizController.startQuizSession);

// ============================================================
// POST /quiz/:sessionId/answer
// ============================================================
/**
 * @swagger
 * /quiz/{sessionId}/answer:
 *   post:
 *     summary: Envía y evalúa una respuesta de una pregunta del quiz.
 *     tags: [Quiz Interactivo]
 *     description: >
 *       Evalúa la respuesta enviada (abierta o de opción múltiple), calcula la XP, guarda el intento y devuelve la siguiente pregunta.  
 *       **Nota importante sobre la guía:** si `acepto_guia: true` el intento se marca como con guía y **no** aplica una reducción automática de XP por pregunta en el controlador; en cambio, el uso de guías se contabiliza para la penalización de gemas al finalizar el quiz.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión de quiz activa (como string).
 *         example: "124"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preguntaId
 *             properties:
 *               preguntaId:
 *                 type: integer
 *                 example: 3
 *               respuestaAbierta:
 *                 type: string
 *                 example: "5.5"
 *               opcionId:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               acepto_guia:
 *                 type: boolean
 *                 example: true
 *                 description: Si el usuario usó la guía paso a paso.
 *               tiempo_restante:
 *                 type: integer
 *                 description: Segundos restantes en el temporizador global.
 *                 example: 1150
 *     responses:
 *       '200':
 *         description: Respuesta procesada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 es_correcta:
 *                   type: boolean
 *                   example: true
 *                   description: Indica si la respuesta fue correcta o no.
 *                 xp_ganada:
 *                   type: integer
 *                   example: 12
 *                   description: >
 *                     XP obtenida en esta pregunta (según la lógica actual del controlador).  
 *                     El controlador no aplica una penalización de XP por el uso de guía en cada pregunta.
 *                 siguientePregunta:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 4
 *                     enunciado_pregunta:
 *                       type: string
 *                       example: "Convierte 0.75 a fracción."
 *                     tipo_pregunta:
 *                       type: string
 *                       example: "respuesta_abierta"
 *                     pasos_guia:
 *                       type: string
 *                       description: "Guía paso a paso (de pago)."
 *                       example: "Simplifica la fracción a 3/4."
 *                     opciones_respuesta:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 9
 *                           texto_respuesta:
 *                             type: string
 *                             example: "3/4"
 *                 mensaje:
 *                   type: string
 *                   example: "Respuesta guardada."
 *       '403':
 *         description: La sesión ha expirado o la pregunta no pertenece a esta sesión.
 *       '404':
 *         description: Sesión o pregunta no encontrada.
 *       '500':
 *         description: Error interno al procesar la respuesta.
 */
router.post('/:sessionId/answer', quizController.submitAnswer);

// ============================================================
// POST /quiz/:sessionId/finish
// ============================================================
/**
 * @swagger
 * /quiz/{sessionId}/finish:
 *   post:
 *     summary: Finaliza manualmente una sesión de quiz.
 *     tags: [Quiz Interactivo]
 *     description: >
 *       Cierra la sesión activa, calcula el puntaje total, XP, gemas obtenidas  
 *       y genera un feedback automático con IA sobre las preguntas falladas.  
 *       También actualiza el progreso del usuario y su cantidad total de XP y gemas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión del quiz (como string).
 *         example: "124"
 *     responses:
 *       '200':
 *         description: Quiz finalizado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Quiz finalizado con éxito!"
 *                 puntaje_total_intento:
 *                   type: integer
 *                   example: 85
 *                 xp_ganada_intento:
 *                   type: integer
 *                   example: 120
 *                 gemas_ganadas_intento:
 *                   type: integer
 *                   example: 12
 *                 respuestas_correctas:
 *                   type: integer
 *                   example: 8
 *                 total_preguntas:
 *                   type: integer
 *                   example: 10
 *                 guias_usadas:
 *                   type: integer
 *                   example: 2
 *                 feedback_id:
 *                   type: string
 *                   nullable: true
 *                   example: "45"
 *                 mejor_puntaje_guardado:
 *                   type: integer
 *                   example: 90
 *                 sessionResult:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "124"
 *                     puntaje_obtenido:
 *                       type: integer
 *                       example: 85
 *                     xp_obtenida:
 *                       type: integer
 *                       example: 120
 *                     gemas_obtenidas:
 *                       type: integer
 *                       example: 12
 *                     estado:
 *                       type: string
 *                       example: "completado"
 *       '404':
 *         description: Sesión no encontrada.
 *       '500':
 *         description: Error interno al finalizar el quiz.
 */
router.post('/:sessionId/finish', quizController.finishQuizSession);

// ============================================================
// GET /quiz/active
// ============================================================
/**
 * @swagger
 * /quiz/active:
 *   get:
 *     summary: Obtiene la sesión de quiz activa del usuario.
 *     tags: [Quiz Interactivo]
 *     description: >
 *       Recupera la sesión de quiz activa (no expirada) del usuario,  
 *       mostrando la pregunta actual y el tiempo restante.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Sesión activa encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   example: "124"
 *                 leccionTitulo:
 *                   type: string
 *                   example: "Fracciones y Decimales"
 *                 tiempo_restante:
 *                   type: integer
 *                   example: 850
 *                 totalPreguntas:
 *                   type: integer
 *                   example: 10
 *                 preguntas_respondidas:
 *                   type: integer
 *                   example: 3
 *                 pregunta_actual:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 4
 *                     enunciado_pregunta:
 *                       type: string
 *                       example: "Convierte 0.75 a fracción."
 *                     tipo_pregunta:
 *                       type: string
 *                       example: "respuesta_abierta"
 *                     pasos_guia:
 *                       type: string
 *                       example: "Simplifica la fracción a 3/4."
 *                     opciones_respuesta:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 9
 *                           texto_respuesta:
 *                             type: string
 *                             example: "3/4"
 *       '204':
 *         description: No hay sesión activa.
 *       '500':
 *         description: Error interno al obtener la sesión activa.
 */
router.get('/active', quizController.getActiveSession);

// ============================================================
// GET /quiz/history
// ============================================================
/**
 * @swagger
 * /quiz/history:
 *   get:
 *     summary: Obtiene el historial de quizzes completados por el usuario.
 *     tags: [Quiz Interactivo]
 *     description: >
 *       Devuelve el historial de todas las sesiones de quiz completadas  
 *       por el usuario, ordenadas por fecha descendente.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Historial obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sessionId:
 *                     type: string
 *                     example: "124"
 *                   leccionId:
 *                     type: integer
 *                     example: 1
 *                   tituloLeccion:
 *                     type: string
 *                     example: "Fracciones y Decimales"
 *                   nombreTema:
 *                     type: string
 *                     example: "Matemáticas Básicas"
 *                   puntaje_total:
 *                     type: integer
 *                     example: 85
 *                   xp_ganada:
 *                     type: integer
 *                     example: 120
 *                   gemas_ganadas:
 *                     type: integer
 *                     example: 12
 *                   intentos_totales:
 *                     type: integer
 *                     example: 3
 *                   feedbackId:
 *                     type: string
 *                     nullable: true
 *                     example: "45"
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-11-10T14:30:00.000Z"
 *       '500':
 *         description: Error interno al obtener el historial.
 */
router.get('/history', quizController.getQuizHistory);

// ============================================================
// GET /quiz/podium/:leccionId
// ============================================================
/**
 * @swagger
 * /quiz/podium/{leccionId}:
 *   get:
 *     summary: Obtiene el podio (top 3) de una lección específica.
 *     tags: [Quiz Interactivo]
 *     description: >
 *       Devuelve los 3 mejores puntajes para una lección específica,  
 *       ordenados de mayor a menor puntaje.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lección para obtener el podio.
 *         example: 1
 *     responses:
 *       '200':
 *         description: Podio obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   position:
 *                     type: integer
 *                     example: 1
 *                   usuarioId:
 *                     type: string
 *                     example: "123"
 *                   nombre:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   puntaje_total:
 *                     type: integer
 *                     example: 100
 *                   xp_ganada:
 *                     type: integer
 *                     example: 150
 *                   gemas_ganadas:
 *                     type: integer
 *                     example: 15
 *       '404':
 *         description: No hay resultados para esta lección.
 *       '500':
 *         description: Error interno al obtener el podio.
 */
router.get('/podium/:leccionId', quizController.getQuizPodium);

module.exports = router;
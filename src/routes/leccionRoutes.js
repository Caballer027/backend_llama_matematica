// ============================================================
// src/routes/leccionRoutes.js
// ============================================================
const express = require('express');
const router = express.Router();
const leccionController = require('../controllers/leccionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Lecciones
 *   description: Gestión de Lecciones, Preguntas y Ranking
 */

// Todas las rutas requieren usuario autenticado
router.use(authMiddleware);

// ============================================================
// 📌 RUTAS PÚBLICAS (ESTUDIANTE)
// ============================================================

/**
 * @swagger
 * /lecciones/{id}:
 *   get:
 *     summary: Obtiene los detalles completos de una lección incluyendo preguntas y opciones (sin marcar correctas)
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
 *       200:
 *         description: Detalles de la lección obtenidos correctamente.
 */
router.get('/:id', leccionController.getLeccionById);


/**
 * @swagger
 * /lecciones/{id}/ranking:
 *   get:
 *     summary: Obtiene el Ranking Top 10 de una lección
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
 *       200:
 *         description: Lista del podio Top 10.
 */
router.get('/:id/ranking', leccionController.getRankingByLeccion);


// ============================================================
// 🔥 RUTAS ADMIN / PROFESOR
// ============================================================

/**
 * @swagger
 * /lecciones:
 *   post:
 *     summary: Crear una nueva lección (contenedor del quiz)
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tema_id, titulo_leccion, orden]
 *             properties:
 *               tema_id:
 *                 type: integer
 *               titulo_leccion:
 *                 type: string
 *               contenido_teorico:
 *                 type: string
 *               orden:
 *                 type: integer
 *               tiempo_limite_segundos:
 *                 type: integer
 *               gemas:
 *                 type: integer
 *               puntos_experiencia:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Lección creada exitosamente.
 */
router.post('/', roleMiddleware.isTeacherOrAdmin, leccionController.createLeccion);


/**
 * @swagger
 * /lecciones/{id}:
 *   put:
 *     summary: Actualizar datos de una lección
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo_leccion:
 *                 type: string
 *               contenido_teorico:
 *                 type: string
 *               orden:
 *                 type: integer
 *               tiempo_limite_segundos:
 *                 type: integer
 *               gemas:
 *                 type: integer
 *               puntos_experiencia:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lección actualizada correctamente.
 */
router.put('/:id', roleMiddleware.isTeacherOrAdmin, leccionController.updateLeccion);


/**
 * @swagger
 * /lecciones/{id}:
 *   delete:
 *     summary: Eliminar una lección
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
 *       200:
 *         description: Lección eliminada.
 */
router.delete('/:id', roleMiddleware.isTeacherOrAdmin, leccionController.deleteLeccion);


// ============================================================
// 🧠 GESTIÓN DE PREGUNTAS (ADMIN/PROFESOR)
// ============================================================

/**
 * @swagger
 * /lecciones/{id}/preguntas:
 *   post:
 *     summary: Crear una nueva pregunta dentro de una lección
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la lección
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enunciado, tipo, puntos]
 *             properties:
 *               enunciado:
 *                 type: string
 *               tipo:
 *                 type: string
 *               puntos:
 *                 type: integer
 *               pasos_guia:
 *                 type: object
 *               url_imagen_pregunta:
 *                 type: string
 *               opciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     texto:
 *                       type: string
 *                     url_imagen:
 *                       type: string
 *                     es_correcta:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Pregunta creada con éxito.
 */
router.post('/:id/preguntas', roleMiddleware.isTeacherOrAdmin, leccionController.createPregunta);


/**
 * @swagger
 * /lecciones/preguntas/{preguntaId}:
 *   put:
 *     summary: Actualizar una pregunta existente (incluye opciones)
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: preguntaId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enunciado:
 *                 type: string
 *               tipo:
 *                 type: string
 *               puntos:
 *                 type: integer
 *               pasos_guia:
 *                 type: object
 *               url_imagen_pregunta:
 *                 type: string
 *               opciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     texto:
 *                       type: string
 *                     url_imagen:
 *                       type: string
 *                     es_correcta:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Pregunta actualizada correctamente.
 */
router.put('/preguntas/:preguntaId', roleMiddleware.isTeacherOrAdmin, leccionController.updatePregunta);


/**
 * @swagger
 * /lecciones/preguntas/{preguntaId}:
 *   delete:
 *     summary: Eliminar una pregunta por ID
 *     tags: [Lecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: preguntaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pregunta eliminada exitosamente.
 */
router.delete('/preguntas/:preguntaId', roleMiddleware.isTeacherOrAdmin, leccionController.deletePregunta);


module.exports = router;

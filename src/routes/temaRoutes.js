// src/routes/temaRoutes.js
const express = require('express');
const router = express.Router();
const temaController = require('../controllers/temaController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // <-- Multer

/**
 * @swagger
 * tags:
 *   name: Temas
 *   description: Endpoints para gestionar los temas y su contenido (historia y lecciones).
 */

// Middleware global: protege todas las rutas de este archivo
router.use(authMiddleware);

// ===================================================================
// GET /api/temas/:id  →  Para la pantalla de "Historia"
// ===================================================================
/**
 * @swagger
 * /temas/{id}:
 *   get:
 *     summary: Obtiene los detalles de un tema (incluyendo su historia e imágenes)
 *     tags: [Temas]
 *     description: Retorna los textos e imágenes que conforman la historia del tema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del tema.
 *     responses:
 *       200:
 *         description: Detalles del tema obtenidos correctamente.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Tema no encontrado.
 */
router.get('/:id', temaController.getTemaById);

// ===================================================================
// GET /api/temas/:id/lecciones
// ===================================================================
/**
 * @swagger
 * /temas/{id}/lecciones:
 *   get:
 *     summary: Obtiene la lista de lecciones del tema
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tema.
 *     responses:
 *       200:
 *         description: Lista de lecciones obtenida con éxito.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Tema no encontrado.
 */
router.get('/:id/lecciones', temaController.getLeccionesPorTema);

// ===================================================================
// 🔥 CRUD NUEVO (ADMIN/PROFESOR) CON SUBIDA DE IMÁGENES
// ===================================================================

// Multer: 3 campos de imágenes
const uploadFields = upload.fields([
  { name: 'imagen_inicio', maxCount: 1 },
  { name: 'imagen_nudo', maxCount: 1 },
  { name: 'imagen_desenlace', maxCount: 1 }
]);

// ===================================================================
// POST /api/temas → Crear tema
// ===================================================================
/**
 * @swagger
 * /temas:
 *   post:
 *     summary: Crea un nuevo tema con texto e imágenes (Admin o Profesor)
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               curso_id:
 *                 type: integer
 *               nombre_tema:
 *                 type: string
 *               orden:
 *                 type: integer
 *               titulo_pregunta:
 *                 type: string
 *               historia_introduccion:
 *                 type: string
 *               historia_nudo:
 *                 type: string
 *               historia_desenlace:
 *                 type: string
 *               imagen_inicio:
 *                 type: string
 *                 format: binary
 *               imagen_nudo:
 *                 type: string
 *                 format: binary
 *               imagen_desenlace:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tema creado exitosamente.
 */
router.post('/', roleMiddleware.isTeacherOrAdmin, uploadFields, temaController.createTema);

// ===================================================================
// PUT /api/temas/:id → Editar tema
// ===================================================================
/**
 * @swagger
 * /temas/{id}:
 *   put:
 *     summary: Actualiza un tema e incluso reemplaza sus imágenes (Admin o Profesor)
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tema a actualizar.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_tema:
 *                 type: string
 *               orden:
 *                 type: integer
 *               titulo_pregunta:
 *                 type: string
 *               historia_introduccion:
 *                 type: string
 *               historia_nudo:
 *                 type: string
 *               historia_desenlace:
 *                 type: string
 *               imagen_inicio:
 *                 type: string
 *                 format: binary
 *               imagen_nudo:
 *                 type: string
 *                 format: binary
 *               imagen_desenlace:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Tema actualizado correctamente.
 */
router.put('/:id', roleMiddleware.isTeacherOrAdmin, uploadFields, temaController.updateTema);

// ===================================================================
// DELETE /api/temas/:id → Eliminar tema
// ===================================================================
/**
 * @swagger
 * /temas/{id}:
 *   delete:
 *     summary: Elimina un tema y sus imágenes relacionadas (Admin o Profesor)
 *     tags: [Temas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tema a eliminar.
 *     responses:
 *       200:
 *         description: Tema eliminado correctamente.
 */
router.delete('/:id', roleMiddleware.isTeacherOrAdmin, temaController.deleteTema);

module.exports = router;

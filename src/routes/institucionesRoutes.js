// src/routes/institucionesRoutes.js
const express = require('express');
const router = express.Router();
const institucionesController = require('../controllers/institucionesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Instituciones
 *   description: Gestión de instituciones educativas.
 */

// ============================================================
// GET /instituciones — Público
// ============================================================
/**
 * @swagger
 * /instituciones:
 *   get:
 *     summary: Lista todas las instituciones
 *     tags: [Instituciones]
 *     responses:
 *       200:
 *         description: Lista obtenida correctamente.
 */
router.get('/', institucionesController.getInstituciones);

// ============================================================
// 🔥 CRUD ADMIN (POST - PUT - DELETE)
// ============================================================

/**
 * @swagger
 * /instituciones:
 *   post:
 *     summary: Crear una nueva institución
 *     tags: [Instituciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "TECSUP Lima"
 *               dominio_correo:
 *                 type: string
 *                 example: "tecsup.edu.pe"
 *     responses:
 *       201:
 *         description: Institución creada exitosamente.
 *       400:
 *         description: Faltan datos requeridos.
 *       409:
 *         description: Ya existe una institución con ese nombre.
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware.isAdmin,
  institucionesController.createInstitucion
);

/**
 * @swagger
 * /instituciones/{id}:
 *   put:
 *     summary: Actualizar una institución
 *     tags: [Instituciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la institución a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "TECSUP Arequipa"
 *               dominio_correo:
 *                 type: string
 *                 example: "tecsup.edu.pe"
 *     responses:
 *       200:
 *         description: Institución actualizada correctamente.
 *       404:
 *         description: Institución no encontrada.
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware.isAdmin,
  institucionesController.updateInstitucion
);

/**
 * @swagger
 * /instituciones/{id}:
 *   delete:
 *     summary: Eliminar una institución
 *     tags: [Instituciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la institución a eliminar
 *     responses:
 *       200:
 *         description: Institución eliminada correctamente.
 *       404:
 *         description: Institución no encontrada.
 *       400:
 *         description: No se pudo eliminar (tiene datos asociados).
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware.isAdmin,
  institucionesController.deleteInstitucion
);

module.exports = router;

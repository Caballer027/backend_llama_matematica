// src/routes/carrerasRoutes.js
const express = require('express');
const router = express.Router();
const carreraController = require('../controllers/carreraController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Carreras
 *   description: Gestión de carreras educativas.
 */

/**
 * @swagger
 * /carreras:
 *   get:
 *     summary: Lista todas las carreras
 *     tags: [Carreras]
 *     responses:
 *       200:
 *         description: Lista obtenida correctamente.
 */
router.get('/', carreraController.getAllCarreras);

/**
 * @swagger
 * /carreras/institucion/{id}:
 *   get:
 *     summary: Obtiene las carreras de una institución
 *     tags: [Carreras]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la institución
 *     responses:
 *       200:
 *         description: Carreras obtenidas correctamente.
 *       404:
 *         description: Institución no encontrada o no tiene carreras.
 */
router.get('/institucion/:id', carreraController.getCarrerasByInstitucion);

// -------- ADMIN CRUD --------

/**
 * @swagger
 * /carreras:
 *   post:
 *     summary: Crear una nueva carrera
 *     tags: [Carreras]
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
 *               - institucion_id
 *             properties:
 *               nombre:
 *                 type: string
 *               institucion_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Carrera creada exitosamente.
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware.isAdmin,
  carreraController.createCarrera
);

/**
 * @swagger
 * /carreras/{id}:
 *   put:
 *     summary: Editar una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               institucion_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Carrera actualizada correctamente.
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware.isAdmin,
  carreraController.updateCarrera
);

/**
 * @swagger
 * /carreras/{id}:
 *   delete:
 *     summary: Eliminar una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Carrera eliminada correctamente.
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware.isAdmin,
  carreraController.deleteCarrera
);

module.exports = router;

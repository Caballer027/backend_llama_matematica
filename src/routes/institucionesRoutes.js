const express = require('express');
const router = express.Router();
const institucionesController = require('../controllers/institucionesController');

/**
 * @swagger
 * tags:
 *   name: Instituciones
 *   description: Endpoints para obtener información de instituciones y sus carreras.
 */

/**
 * @swagger
 * /instituciones:
 *   get:
 *     summary: Obtiene la lista de todas las instituciones disponibles
 *     tags: [Instituciones]
 *     description: Retorna todas las instituciones registradas en la base de datos.
 *     responses:
 *       200:
 *         description: Lista de instituciones obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nombre_institucion:
 *                     type: string
 *                     example: "TECSUP Lima"
 */
router.get('/', institucionesController.getInstituciones);

/**
 * @swagger
 * /instituciones/{id}/carreras:
 *   get:
 *     summary: Obtiene las carreras asociadas a una institución
 *     tags: [Instituciones]
 *     description: Devuelve todas las carreras pertenecientes a una institución específica.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la institución.
 *     responses:
 *       200:
 *         description: Lista de carreras obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   nombre_carrera:
 *                     type: string
 *                     example: "Ingeniería de Software"
 *       404:
 *         description: Institución no encontrada.
 */
router.get('/:id/carreras', institucionesController.getCarrerasByInstitucion);

module.exports = router;

const express = require('express');
const router = express.Router();
const ciclosController = require('../controllers/ciclosController');

/**
 * @swagger
 * tags:
 *   name: Ciclos
 *   description: Endpoints para obtener los ciclos académicos.
 */

/**
 * @swagger
 * /ciclos:
 *   get:
 *     summary: Obtiene la lista de todos los ciclos
 *     tags: [Ciclos]
 *     description: Retorna todos los ciclos registrados en la base de datos, ordenados por número.
 *     responses:
 *       200:
 *         description: Lista de ciclos obtenida correctamente.
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
 *                   nombre_ciclo:
 *                     type: string
 *                     example: "Primer ciclo"
 *                   numero_ciclo:
 *                     type: integer
 *                     example: 1
 */
router.get('/', ciclosController.getCiclos);

module.exports = router;

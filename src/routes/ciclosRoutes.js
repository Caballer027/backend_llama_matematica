const express = require('express');
const router = express.Router();
const ciclosController = require('../controllers/ciclosController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ciclos
 *   description: Administración y consulta de ciclos académicos.
 */

// Middleware global → requiere JWT para todas las rutas
router.use(authMiddleware);

/**
 * ===================================================================
 * GET /api/ciclos
 * ===================================================================
 */
/**
 * @swagger
 * /ciclos:
 *   get:
 *     summary: Obtiene la lista de ciclos académicos
 *     tags: [Ciclos]
 *     description: Devuelve todos los ciclos registrados en la base de datos, ordenados por número.
 *     security:
 *       - bearerAuth: []
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
 *                   nombre:
 *                     type: string
 *                     example: "Primer Ciclo"
 *                   numero:
 *                     type: integer
 *                     example: 1
 */
router.get('/', ciclosController.getCiclos);


/**
 * ===================================================================
 * POST /api/ciclos  (SOLO ADMIN)
 * ===================================================================
 */
/**
 * @swagger
 * /ciclos:
 *   post:
 *     summary: Crea un nuevo ciclo académico (solo ADMIN)
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los administradores pueden registrar nuevos ciclos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Cuarto Ciclo"
 *               numero:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Ciclo creado correctamente.
 *       400:
 *         description: Datos incompletos.
 *       401:
 *         description: Token inválido.
 *       403:
 *         description: No autorizado (solo administradores).
 *       500:
 *         description: Error interno.
 */
router.post('/', adminMiddleware, ciclosController.createCiclo);


/**
 * ===================================================================
 * PUT /api/ciclos/:id  (SOLO ADMIN)
 * ===================================================================
 */
/**
 * @swagger
 * /ciclos/{id}:
 *   put:
 *     summary: Actualiza un ciclo existente (solo ADMIN)
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Primer Ciclo Actualizado"
 *               numero:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Ciclo actualizado correctamente.
 *       400:
 *         description: Datos incompletos.
 *       403:
 *         description: Solo administradores.
 *       404:
 *         description: Ciclo no encontrado.
 *       500:
 *         description: Error interno.
 */
router.put('/:id', adminMiddleware, ciclosController.updateCiclo);


/**
 * ===================================================================
 * DELETE /api/ciclos/:id  (SOLO ADMIN)
 * ===================================================================
 */
/**
 * @swagger
 * /ciclos/{id}:
 *   delete:
 *     summary: Elimina un ciclo (solo ADMIN)
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Ciclo eliminado correctamente.
 *       403:
 *         description: Solo administradores.
 *       409:
 *         description: No se puede eliminar porque tiene cursos asociados.
 *       500:
 *         description: Error interno.
 */
router.delete('/:id', adminMiddleware, ciclosController.deleteCiclo);

module.exports = router;

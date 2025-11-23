// src/routes/tiendaRoutes.js
const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const protect = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Tienda
 *   description: Endpoints para ver y comprar items (ropa y consumibles).
 */

// Middleware: protege todas las rutas de este archivo
router.use(protect);

// ===================================================================
//   GET /api/tienda/items
// ===================================================================
/**
 * @swagger
 * /tienda/items:
 *   get:
 *     summary: Obtiene todos los items de la tienda (Ropa y Consumibles)
 *     tags: [Tienda]
 *     description: Devuelve una lista de ropa (polos) disponibles para comprar.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de items obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 101
 *                   nombre_item:
 *                     type: string
 *                     example: "Polo N° 1 (Rojo)"
 *                   costo_gemas:
 *                     type: integer
 *                     example: 100
 *                   url_icono_tienda:
 *                     type: string
 *                     example: "http://localhost:3000/images/polo_1.png"
 *                   url_imagenes_equipado:
 *                     type: object
 *                     example: { "LEON": "...", "CONEJO": "...", "HIPOPOTAMO": "..." }
 *       '401':
 *         description: No autorizado.
 *       '500':
 *         description: Error interno al obtener los items.
 */
router.get('/items', tiendaController.getItems);

// ===================================================================
//   POST /api/tienda/comprar
// ===================================================================
/**
 * @swagger
 * /tienda/comprar:
 *   post:
 *     summary: Compra un item (ropa o consumible) de la tienda
 *     tags: [Tienda]
 *     description: Descuenta las gemas del usuario y añade el item al inventario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: ID del item que se desea comprar.
 *                 example: 101
 *     responses:
 *       '200':
 *         description: ¡Compra exitosa!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Compra exitosa!"
 *                 gemasRestantes:
 *                   type: integer
 *                   example: 350
 *       '400':
 *         description: Error en la compra (No tienes gemas, ya lo posees, etc.).
 *       '401':
 *         description: No autorizado.
 */
router.post('/comprar', tiendaController.comprarItem);

module.exports = router;
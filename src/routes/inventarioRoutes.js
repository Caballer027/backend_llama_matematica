// src/routes/inventarioRoutes.js
const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const protect = require('../middleware/authMiddleware');

// =============================================================================
// SWAGGER TAGS
// =============================================================================

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Endpoints para equipar, desequipar y obtener el estado del equipo del personaje
 */

// =============================================================================
// RUTAS CON AUTENTICACIÓN
// =============================================================================

// -----------------------------------------------------------------------------
// POST /api/inventario/equipar
// -----------------------------------------------------------------------------

/**
 * @swagger
 * /inventario/equipar:
 *   post:
 *     summary: Equipa un ítem de ropa en el personaje
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Ítem equipado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Item equipado con éxito!"
 *       '400':
 *         description: Error en la solicitud (ej. Item ID requerido)
 *       '401':
 *         description: No autorizado
 *       '403':
 *         description: No posees este item en tu inventario
 */
router.post('/equipar', protect, inventarioController.equiparItem);

// -----------------------------------------------------------------------------
// POST /api/inventario/desequipar
// -----------------------------------------------------------------------------

/**
 * @swagger
 * /inventario/desequipar:
 *   post:
 *     summary: Desequipa un ítem de un slot específico
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *             properties:
 *               slotId:
 *                 type: integer
 *                 description: ID del TIPO de item (ej. el ID de 'Ropa (Polos)')
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Ítem desequipado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item desequipado con éxito."
 *       '400':
 *         description: Error en la solicitud (ej. slotId requerido)
 *       '401':
 *         description: No autorizado
 */
router.post('/desequipar', protect, inventarioController.desequiparItem);

// -----------------------------------------------------------------------------
// GET /api/inventario/equipo/activo
// -----------------------------------------------------------------------------

/**
 * @swagger
 * /inventario/equipo/activo:
 *   get:
 *     summary: Obtiene la información actual del personaje y el ítem equipado
 *     tags: [Inventario]
 *     description: Devuelve la URL de la imagen que el frontend debe mostrar (base o con polo), mensajes y nombre
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Estado del equipo del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_personalizado:
 *                   type: string
 *                   example: "BRIZALI"
 *                 personaje_base:
 *                   type: string
 *                   example: "BRIZALI"
 *                 personaje_key:
 *                   type: string
 *                   example: "LEON"
 *                 url_avatar_actual:
 *                   type: string
 *                   example: "http://localhost:3000/images/leon_polo_3.png"
 *                 mensajes:
 *                   type: object
 *                   properties:
 *                     corta:
 *                       type: string
 *                     larga:
 *                       type: string
 *                 item_equipado:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     nombre_item:
 *                       type: string
 *                       example: "Polo N° 3 (Verde)"
 *                     url_imagenes_equipado:
 *                       type: object
 *                       example: { "LEON": "...", "CONEJO": "...", "HIPOPOTAMO": "..." }
 *       '401':
 *         description: No autorizado
 *       '404':
 *         description: Personaje no encontrado
 */
router.get('/equipo/activo', protect, inventarioController.getEquipoActivo);

// =============================================================================
// EXPORTACIÓN
// =============================================================================

module.exports = router;
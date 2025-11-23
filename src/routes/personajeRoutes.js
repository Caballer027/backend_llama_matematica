// ============================================================
// src/routes/personajeRoutes.js (V4.2 - COMPLETO Y ACTUALIZADO)
// ============================================================

const express = require('express');
const router = express.Router();
const personajeController = require('../controllers/personajeController');
const authMiddleware = require('../middleware/authMiddleware');

// ============================================================
// SWAGGER: Personajes
// ============================================================
/**
 * @swagger
 * tags:
 *   name: Personajes
 *   description: Endpoints para listar y seleccionar personajes del sistema.
 */

// Se requiere autenticación para todos los endpoints
router.use(authMiddleware);

// ===================================================================
// GET /api/personajes
// ===================================================================
/**
 * @swagger
 * /personajes:
 *   get:
 *     summary: Obtiene la lista de todos los personajes disponibles
 *     tags: [Personajes]
 *     description: |
 *       Devuelve un listado con los personajes base del sistema.  
 *       Cada personaje contiene información visual y narrativa, como su nombre, imagen y mensajes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de personajes obtenida con éxito.
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
 *                     example: "Khipu"
 *                   asset_key:
 *                     type: string
 *                     example: "khipu_asset"
 *                   url_imagen_base:
 *                     type: string
 *                     example: "https://cdn.servidor.com/khipu.png"
 *                   mensaje_corta:
 *                     type: string
 *                     example: "El sabio guía de los Andes."
 *                   mensaje_larga:
 *                     type: string
 *                     example: "Khipu te ayudará a superar desafíos matemáticos con su sabiduría ancestral."
 *       '500':
 *         description: Error interno del servidor al obtener los personajes.
 */
router.get('/', personajeController.getAllPersonajes);

// ===================================================================
// POST /api/personajes/seleccionar
// ===================================================================
/**
 * @swagger
 * /personajes/seleccionar:
 *   post:
 *     summary: Selecciona el personaje activo del usuario
 *     tags: [Personajes]
 *     description: |
 *       Actualiza el perfil del usuario autenticado para establecer qué personaje está usando actualmente.  
 *       El usuario debe enviar el `personajeId` del personaje que desea seleccionar.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personajeId:
 *                 type: integer
 *                 description: ID del personaje a seleccionar.
 *                 example: 2
 *     responses:
 *       '200':
 *         description: ¡Éxito! Personaje seleccionado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "¡Has seleccionado a Inti!"
 *                 personajeActivo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     nombre:
 *                       type: string
 *                       example: "Inti"
 *                     asset_key:
 *                       type: string
 *                       example: "inti_asset"
 *                     url_imagen_base:
 *                       type: string
 *                       example: "https://cdn.servidor.com/inti.png"
 *                     mensaje_corta:
 *                       type: string
 *                       example: "El dios del Sol brillante."
 *                     mensaje_larga:
 *                       type: string
 *                       example: "Inti te llenará de energía y motivación en cada reto."
 *       '400':
 *         description: El ID del personaje es requerido.
 *       '404':
 *         description: Personaje o usuario no encontrado.
 *       '500':
 *         description: Error interno del servidor al seleccionar el personaje.
 */
router.post('/seleccionar', personajeController.seleccionarPersonaje);

module.exports = router;

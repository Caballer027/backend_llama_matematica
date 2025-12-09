// ============================================================
// src/routes/personajeRoutes.js (V6.0 – COMPLETO, ACTUALIZADO Y FUNCIONAL)
// ============================================================

const express = require('express');
const router = express.Router();

const personajeController = require('../controllers/personajeController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// 🧩 MULTER: Guardar imágenes en /public/personajes
// ============================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../public/personajes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ============================================================
// SWAGGER: Personajes
// ============================================================
/**
 * @swagger
 * tags:
 *   name: Personajes
 *   description: Endpoints para gestionar personajes del sistema.
 */

// ============================================================
// 🔐 Todas las rutas requieren autenticación
// ============================================================
router.use(protect);

// ===================================================================
// GET /api/personajes
// ===================================================================
/**
 * @swagger
 * /personajes:
 *   get:
 *     summary: Obtiene la lista de todos los personajes disponibles
 *     tags: [Personajes]
 *     description: Lista de personajes con datos visuales y descripciones.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de personajes obtenida exitosamente.
 *       '500':
 *         description: Error interno del servidor.
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
 *     security:
 *       - bearerAuth: []
 *     description: Selecciona qué personaje estará activo para el usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personajeId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       '200':
 *         description: Personaje seleccionado correctamente.
 *       '400':
 *         description: Falta ID del personaje.
 *       '404':
 *         description: Personaje no encontrado.
 */
router.post('/seleccionar', personajeController.seleccionarPersonaje);

// ============================================================
// 🔥 CRUD ADMIN
// ============================================================

// ===================================================================
// POST /api/personajes  (Crear personaje)
// ===================================================================
/**
 * @swagger
 * /personajes:
 *   post:
 *     summary: Crea un nuevo personaje (ADMIN)
 *     tags: [Personajes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               asset_key: { type: string }
 *               mensaje_corta: { type: string }
 *               mensaje_larga: { type: string }
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201': { description: Personaje creado. }
 */
router.post(
  '/',
  roleMiddleware.isAdmin,
  upload.single('imagen'),
  personajeController.createPersonaje
);

// ===================================================================
// PUT /api/personajes/:id (Actualizar personaje)
// ===================================================================
/**
 * @swagger
 * /personajes/{id}:
 *   put:
 *     summary: Actualiza un personaje (ADMIN)
 *     tags: [Personajes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               mensaje_corta: { type: string }
 *               mensaje_larga: { type: string }
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200': { description: Personaje actualizado correctamente. }
 *       '404': { description: Personaje no encontrado. }
 */
router.put(
  '/:id',
  roleMiddleware.isAdmin,
  upload.single('imagen'),
  personajeController.updatePersonaje
);

// ===================================================================
// DELETE /api/personajes/:id (Eliminar personaje con Limpieza Profunda)
// ===================================================================
/**
 * @swagger
 * /personajes/{id}:
 *   delete:
 *     summary: Elimina un personaje (ADMIN) junto con sus assets asociados
 *     tags: [Personajes]
 *     security: [{ bearerAuth: [] }]
 *     description: >
 *       Elimina un personaje, su imagen base y **todas las imágenes equipables**
 *       relacionadas dentro de los ítems de la tienda (limpieza profunda).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Personaje y assets eliminados correctamente.
 *       '400':
 *         description: No se puede eliminar porque está en uso por un usuario.
 *       '404':
 *         description: Personaje no encontrado.
 *       '500':
 *         description: Error interno del servidor.
 */
router.delete('/:id', roleMiddleware.isAdmin, personajeController.deletePersonaje);

module.exports = router;

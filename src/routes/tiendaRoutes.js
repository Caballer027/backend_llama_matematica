// ============================================================
// src/routes/tiendaRoutes.js — VERSIÓN COMPLETA 6.0 (MODIFICADA: upload.any())
// ============================================================
const express = require('express');
const router = express.Router();

const tiendaController = require('../controllers/tiendaController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===================================================================
// 📦 1. CONFIGURACIÓN MULTER (IMÁGENES TIENDA)
// ===================================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../public/tienda');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Campos aceptados
const uploadFields = upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'icono', maxCount: 1 },
  { name: 'img_leon', maxCount: 1 },
  { name: 'img_hipo', maxCount: 1 },
  { name: 'img_conejo', maxCount: 1 },
]);

// ===================================================================
// 🔐 TODAS LAS RUTAS REQUIEREN LOGIN
// ===================================================================
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Tienda
 *   description: Endpoints para ver, comprar y administrar los ítems del sistema.
 */

// ===================================================================
// 📌 GET /tienda/items — Obtener Items
// ===================================================================
/**
 * @swagger
 * /tienda/items:
 *   get:
 *     summary: Obtiene todos los items de la tienda.
 *     description: |
 *       Puedes filtrar por tipo usando el query param `?tipo=Ropa`, `?tipo=Fondo`, `?tipo=Pista`, etc.
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtra items por tipo (nombre del tipo_item)
 *     responses:
 *       200:
 *         description: Lista de items obtenida correctamente.
 *       401:
 *         description: Usuario no autorizado.
 */
router.get('/items', tiendaController.getItems);

// ===================================================================
// 🛒 POST /tienda/comprar — Comprar Item
// ===================================================================
/**
 * @swagger
 * /tienda/comprar:
 *   post:
 *     summary: Compra un item de la tienda.
 *     tags: [Tienda]
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
 *                 example: 101
 *     responses:
 *       200:
 *         description: Compra exitosa.
 *       400:
 *         description: Error (sin gemas, item repetido o inválido).
 *       401:
 *         description: No autorizado.
 */
router.post('/comprar', tiendaController.comprarItem);

// ===================================================================
// 👕 GET /tienda/tipos — Obtener Tipos (ADMIN/TEACHER)
// ===================================================================
/**
 * @swagger
 * /tienda/tipos:
 *   get:
 *     summary: Obtiene todos los tipos de items disponibles.
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos obtenida correctamente.
 *       403:
 *         description: Solo para Admin o Teacher.
 */
router.get('/tipos', roleMiddleware.isTeacherOrAdmin, tiendaController.getTiposItem);

// ===================================================================
// 👑 ADMIN — CRUD DE ITEMS
// ===================================================================

// --------------------------------------------------------------------
// 📌 POST /tienda/items — Crear item
// --------------------------------------------------------------------
/**
 * @swagger
 * /tienda/items:
 *   post:
 *     summary: Crea un nuevo item de la tienda. (ADMIN)
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Crea un item con imágenes opcionales.
 *       El backend soporta `imagen` (nuevo frontend) o `icono` (legacy).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_item
 *               - costo_gemas
 *               - tipo_item_id
 *             properties:
 *               nombre_item:
 *                 type: string
 *                 example: "Polo Azul"
 *               descripcion:
 *                 type: string
 *               costo_gemas:
 *                 type: integer
 *                 example: 150
 *               tipo_item_id:
 *                 type: integer
 *                 example: 1
 *               asset_index:
 *                 type: integer
 *                 example: 3
 *               imagen:
 *                 type: string
 *                 format: binary
 *               icono:
 *                 type: string
 *                 format: binary
 *               img_leon:
 *                 type: string
 *                 format: binary
 *               img_hipo:
 *                 type: string
 *                 format: binary
 *               img_conejo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item creado correctamente.
 *       400:
 *         description: Datos obligatorios faltantes.
 *       403:
 *         description: Solo Admin.
 */
router.post('/items', roleMiddleware.isAdmin, upload.any(), tiendaController.createItem);

// --------------------------------------------------------------------
// 📌 PUT /tienda/items/:id — Actualizar item
// --------------------------------------------------------------------
/**
 * @swagger
 * /tienda/items/{id}:
 *   put:
 *     summary: Actualiza un item existente. (ADMIN)
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_item:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               costo_gemas:
 *                 type: integer
 *               tipo_item_id:
 *                 type: integer
 *               asset_index:
 *                 type: integer
 *               imagen:
 *                 type: string
 *                 format: binary
 *               icono:
 *                 type: string
 *                 format: binary
 *               img_leon:
 *                 type: string
 *                 format: binary
 *               img_hipo:
 *                 type: string
 *                 format: binary
 *               img_conejo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Item actualizado.
 *       403:
 *         description: Requiere rol Admin.
 *       404:
 *         description: Item no encontrado.
 */
router.put('/items/:id', roleMiddleware.isAdmin, upload.any(), tiendaController.updateItem);

// --------------------------------------------------------------------
// 📌 DELETE /tienda/items/:id — Eliminar item
// --------------------------------------------------------------------
/**
 * @swagger
 * /tienda/items/{id}:
 *   delete:
 *     summary: Elimina un item de la tienda. (ADMIN)
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item eliminado correctamente.
 *       403:
 *         description: Solo Admin.
 *       404:
 *         description: Item no encontrado.
 */
router.delete('/items/:id', roleMiddleware.isAdmin, tiendaController.deleteItem);

// ============================================================
// 🔥 CRUD DE TIPOS DE ITEM (CATEGORÍAS) — ADMIN
// ============================================================

// -------------------------------
// 📌 POST — Crear Tipo
// -------------------------------
/**
 * @swagger
 * /tienda/tipos:
 *   post:
 *     summary: Crea un nuevo tipo de item. (ADMIN)
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_tipo
 *             properties:
 *               nombre_tipo:
 *                 type: string
 *                 example: "Sombreros"
 *     responses:
 *       201:
 *         description: Tipo creado correctamente.
 *       403:
 *         description: Solo Admin.
 */
router.post('/tipos', roleMiddleware.isAdmin, tiendaController.createTipo);

// -------------------------------
// 📌 PUT — Actualizar Tipo
// -------------------------------
/**
 * @swagger
 * /tienda/tipos/{id}:
 *   put:
 *     summary: Actualiza un tipo de item. (ADMIN)
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo actualizado.
 */
router.put('/tipos/:id', roleMiddleware.isAdmin, tiendaController.updateTipo);

// -------------------------------
// 📌 DELETE — Eliminar Tipo
// -------------------------------
/**
 * @swagger
 * /tienda/tipos/{id}:
 *   delete:
 *     summary: Elimina un tipo de item. (ADMIN)
 *     tags: [Tienda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Tipo eliminado correctamente.
 *       400:
 *         description: No se puede eliminar porque tiene items relacionados.
 */
router.delete('/tipos/:id', roleMiddleware.isAdmin, tiendaController.deleteTipo);

module.exports = router;

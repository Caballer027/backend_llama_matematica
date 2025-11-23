// src/routes/temaRoutes.js
const express = require('express');
const router = express.Router();
const temaController = require('../controllers/temaController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Temas
 *   description: Endpoints para gestionar los temas y su contenido (historia y lecciones).
 */

// Middleware global: protege todas las rutas de este archivo
router.use(authMiddleware);

// ===================================================================
// GET /api/temas/:id  →  Para la pantalla de "Historia"
// ===================================================================
/**
 * @swagger
 * /temas/{id}:
 *   get:
 *     summary: Obtiene los detalles de un tema (incluyendo su historia e imágenes)
 *     tags: [Temas]
 *     description: Retorna los textos e imágenes que conforman la historia del tema (introducción, nudo y desenlace).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del tema.
 *         example: 1
 *     responses:
 *       '200':
 *         description: Detalles del tema obtenidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 nombre_tema:
 *                   type: string
 *                   example: "Historia del Cálculo"
 *                 titulo_pregunta:
 *                   type: string
 *                   example: "¿Quién fue el creador del cálculo diferencial?"
 *                 historia_introduccion:
 *                   type: string
 *                   example: "El cálculo nació en el siglo XVII gracias a Newton y Leibniz..."
 *                 historia_nudo:
 *                   type: string
 *                   example: "Ambos desarrollaron métodos similares de forma independiente..."
 *                 historia_desenlace:
 *                   type: string
 *                   example: "Finalmente, ambos fueron reconocidos por su aporte a las matemáticas modernas."
 *                 url_imagen_inicio:
 *                   type: string
 *                   example: "https://cdn.llama-matematica.com/imagenes/introduccion.png"
 *                 url_imagen_nudo:
 *                   type: string
 *                   example: "https://cdn.llama-matematica.com/imagenes/nudo.png"
 *                 url_imagen_desenlace:
 *                   type: string
 *                   example: "https://cdn.llama-matematica.com/imagenes/desenlace.png"
 *       '401':
 *         description: No autorizado. El token JWT es inválido o ha expirado.
 *       '404':
 *         description: Tema no encontrado.
 */
router.get('/:id', temaController.getTemaById);

// ===================================================================
// GET /api/temas/:id/lecciones  →  Para mostrar las lecciones del tema
// ===================================================================
/**
 * @swagger
 * /temas/{id}/lecciones:
 *   get:
 *     summary: Obtiene la lista de lecciones (quizzes) de un tema específico
 *     tags: [Temas]
 *     description: Devuelve un arreglo de objetos con las lecciones asociadas al tema, ordenadas por el campo `orden`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del tema.
 *         example: 1
 *     responses:
 *       '200':
 *         description: Lista de lecciones del tema obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 3
 *                   titulo_leccion:
 *                     type: string
 *                     example: "Derivadas Básicas"
 *                   orden:
 *                     type: integer
 *                     example: 2
 *       '401':
 *         description: No autorizado. El token JWT es inválido o ha expirado.
 *       '404':
 *         description: Tema no encontrado.
 */
router.get('/:id/lecciones', temaController.getLeccionesPorTema);

module.exports = router;

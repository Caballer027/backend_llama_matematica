const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Endpoints para visualizar los cursos y su estructura (temario).
 */

// Middleware global: aplica autenticación a todas las rutas de este archivo
router.use(authMiddleware);

// ===================================================================
// GET /api/cursos
// ===================================================================
/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Obtiene la lista de todos los cursos disponibles
 *     tags: [Cursos]
 *     description: Devuelve un array con todos los cursos, indicando si están bloqueados o desbloqueados para el usuario actual.
 *     security:
 *       - bearerAuth: [] # Requiere token JWT
 *     responses:
 *       '200':
 *         description: Lista de cursos obtenida con éxito.
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
 *                   nombre_curso:
 *                     type: string
 *                     example: "Cálculo y Estadística"
 *                   descripcion:
 *                     type: string
 *                     example: "Curso fundamental..."
 *                   ciclo_id:
 *                     type: integer
 *                     description: ID del ciclo al que pertenece el curso.
 *                     example: 1
 *                   esta_bloqueado:
 *                     type: boolean
 *                     description: True si el usuario no puede acceder a este curso (es de un ciclo superior).
 *                     example: false
 *       '401':
 *         description: No autorizado (token inválido o no provisto).
 *       '500':
 *         description: Error interno al obtener los cursos.
 */
router.get('/', cursoController.getAllCursos);

// ===================================================================
// GET /api/cursos/:id/temario (¡SWAGGER ACTUALIZADO!)
// ===================================================================

/**
 * @swagger
 * /cursos/{id}/temario:
 *   get:
 *     summary: Obtiene el temario (lista de temas/semanas) de un curso
 *     tags: [Cursos]
 *     description: Devuelve un array con los temas que componen un curso, ordenados y con el formato "SEM X".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID numérico del curso.
 *         example: 1
 *     responses:
 *       '200':
 *         description: Temario del curso obtenido con éxito.
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
 *                   nombre_tema:
 *                     type: string
 *                     example: "Ecuaciones lineales"
 *                   orden:
 *                     type: integer
 *                     example: 1
 *                   semana:
 *                     type: string
 *                     description: El campo "orden" formateado como "SEM X".
 *                     example: "SEM 1"
 *       '401':
 *         description: No autorizado.
 *       '404':
 *         description: Curso no encontrado.
 *       '500':
 *         description: Error interno al obtener el temario.
 */

router.get('/:id/temario', cursoController.getTemarioPorCurso);

module.exports = router;
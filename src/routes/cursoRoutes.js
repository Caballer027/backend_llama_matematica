// src/routes/cursoRoutes.js
const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware'); // <--- AGREGADO

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Endpoints para gestión y visualización de cursos
 */

// Middleware global: TODAS las rutas requieren autenticación
router.use(authMiddleware);

// ===================================================================
// GET /api/cursos
// ===================================================================
/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Lista todos los cursos disponibles
 *     tags: [Cursos]
 *     description: Devuelve todos los cursos indicando si están bloqueados según el ciclo del usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de cursos obtenida exitosamente.
 *       '401':
 *         description: Token inválido o no enviado.
 *       '500':
 *         description: Error interno del servidor.
 */
router.get('/', cursoController.getAllCursos);

// ===================================================================
// GET /api/cursos/:id
// ===================================================================
/**
 * @swagger
 * /cursos/{id}:
 *   get:
 *     summary: Obtiene un curso por ID
 *     tags: [Cursos]
 *     description: Devuelve la información completa del curso, incluyendo temas y lecciones ordenadas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       '200':
 *         description: Curso encontrado.
 *       '404':
 *         description: Curso no encontrado.
 *       '401':
 *         description: No autorizado.
 *       '500':
 *         description: Error interno.
 */
router.get('/:id', cursoController.getCursoById);

// ===================================================================
// GET /api/cursos/:id/temario
// ===================================================================
/**
 * @swagger
 * /cursos/{id}/temario:
 *   get:
 *     summary: Obtiene el temario (lista de temas/semanas) de un curso
 *     tags: [Cursos]
 *     description: Devuelve el listado ordenado de temas con el campo "SEM X".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       '200':
 *         description: Temario obtenido exitosamente.
 *       '404':
 *         description: Curso no encontrado.
 *       '401':
 *         description: No autorizado.
 *       '500':
 *         description: Error interno.
 */
router.get('/:id/temario', cursoController.getTemarioPorCurso);

// ===================================================================
// POST /api/cursos (CREAR CURSO)
// ===================================================================
/**
 * @swagger
 * /cursos:
 *   post:
 *     summary: Crea un nuevo curso (Admin / Profesor)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_curso
 *               - ciclo_id
 *             properties:
 *               nombre_curso:
 *                 type: string
 *                 example: "Álgebra Lineal"
 *               descripcion:
 *                 type: string
 *                 example: "Curso fundamental"
 *               ciclo_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       '201':
 *         description: Curso creado exitosamente.
 *       '400':
 *         description: Falta información obligatoria.
 *       '409':
 *         description: Ya existe un curso con ese nombre.
 *       '401':
 *         description: No autorizado.
 *       '500':
 *         description: Error interno.
 */
router.post(
  '/',
  roleMiddleware.isTeacherOrAdmin,  // <--- PROTECCIÓN AGREGADA
  cursoController.createCurso
);

// ===================================================================
// PUT /api/cursos/:id (ACTUALIZAR)
// ===================================================================
/**
 * @swagger
 * /cursos/{id}:
 *   put:
 *     summary: Actualiza un curso existente
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_curso:
 *                 type: string
 *                 example: "Álgebra Superior"
 *               descripcion:
 *                 type: string
 *                 example: "Curso actualizado"
 *               ciclo_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       '200':
 *         description: Curso actualizado exitosamente.
 *       '401':
 *         description: No autorizado.
 *       '404':
 *         description: Curso no encontrado.
 *       '500':
 *         description: Error interno.
 */
router.put(
  '/:id',
  roleMiddleware.isTeacherOrAdmin,  // <--- PROTECCIÓN AGREGADA
  cursoController.updateCurso
);

// ===================================================================
// DELETE /api/cursos/:id
// ===================================================================
/**
 * @swagger
 * /cursos/{id}:
 *   delete:
 *     summary: Elimina un curso (solo si no tiene temas asociados)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Curso eliminado.
 *       '400':
 *         description: No se puede eliminar el curso.
 *       '401':
 *         description: No autorizado.
 *       '404':
 *         description: Curso no encontrado.
 *       '500':
 *         description: Error interno.
 */
router.delete(
  '/:id',
  roleMiddleware.isTeacherOrAdmin,  // <--- PROTECCIÓN AGREGADA
  cursoController.deleteCurso
);

module.exports = router;

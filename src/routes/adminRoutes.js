// ============================================================
// src/routes/adminRoutes.js — FINAL 8.0 (SEGURIDAD HÍBRIDA)
// ============================================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Panel de control, analítica y gestión (Acceso Admin y Profesores)
 */

// 🔒 SEGURIDAD BASE: Todo requiere estar logueado
router.use(authMiddleware);

// ============================================================
// 🟢 ZONA COMÚN (ADMIN + PROFESORES)
// Dashboard, Analíticas y Lista de Estudiantes
// ============================================================

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Dashboard Operativo (KPIs y Alertas)
 *     description: Retorna métricas y alertas. Si es Profesor, solo ve su institución.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos.
 */
router.get(
  '/dashboard',
  roleMiddleware.isTeacherOrAdmin,
  adminController.getDashboardStats
);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Analítica Visual (Gráficos)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de gráficas.
 */
router.get(
  '/analytics',
  roleMiddleware.isTeacherOrAdmin,
  adminController.getAnalytics
);

/**
 * @swagger
 * /admin/analytics/advanced:
 *   get:
 *     summary: Reportes Académicos Detallados
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes detallados.
 */
router.get(
  '/analytics/advanced',
  roleMiddleware.isTeacherOrAdmin,
  adminController.getAdvancedReports
);

/**
 * @swagger
 * /admin/estudiantes:
 *   get:
 *     summary: Listar estudiantes (Progreso y Economía)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudiantes.
 */
router.get(
  '/estudiantes',
  roleMiddleware.isTeacherOrAdmin,
  adminController.getEstudiantes
);

// ============================================================
// 🔴 ZONA EXCLUSIVA (SOLO ADMIN)
// Gestión de Usuarios, Profesores y Borrado
// ============================================================

/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     summary: Listar TODOS los usuarios del sistema (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa.
 */
router.get(
  '/usuarios',
  roleMiddleware.isAdmin,
  adminController.getAllUsers
);

/**
 * @swagger
 * /admin/usuarios/{id}:
 *   get:
 *     summary: Ver perfil completo de usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle usuario.
 */
router.get(
  '/usuarios/:id',
  roleMiddleware.isAdmin,
  adminController.getUserById
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Eliminar cualquier usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado.
 */
router.delete(
  '/users/:id',
  roleMiddleware.isAdmin,
  adminController.deleteUsuario
);

/**
 * @swagger
 * /admin/profesores:
 *   get:
 *     summary: Listar profesores y cursos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista profesores.
 *
 *   post:
 *     summary: Crear nuevo profesor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, correo_electronico, contrasena]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               correo_electronico:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               institucion_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Profesor creado.
 */
router.get(
  '/profesores',
  roleMiddleware.isAdmin,
  adminController.getAllProfessors
);

router.post(
  '/profesores',
  roleMiddleware.isAdmin,
  adminController.createProfessor
);

/**
 * @swagger
 * /admin/profesores/asignar-curso:
 *   post:
 *     summary: Asignar curso a profesor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profesor_id:
 *                 type: string
 *               curso_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Asignado.
 */
router.post(
  '/profesores/asignar-curso',
  roleMiddleware.isAdmin,
  adminController.assignCourseToProfessor
);

module.exports = router;

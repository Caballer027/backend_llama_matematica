const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Estudiante
 *   description: Endpoints relacionados con las estadísticas y rendimiento del estudiante.
 */

/**
 * @swagger
 * /estudiante/estadisticas:
 *   get:
 *     summary: Obtiene las estadísticas del estudiante autenticado
 *     tags: [Estudiante]
 *     description: Devuelve información dinámica del estudiante autenticado, incluyendo evolución de puntaje, tiempo dedicado, progreso y tasa de repetición por tema.
 *     security:
 *       - bearerAuth: []  # requiere token JWT
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente.
 *         content:
 *           application/json:
 *             example:
 *               evolucionPuntaje:
 *                 - mes: "Octubre"
 *                   porcentaje: 85
 *               tiempoDedicado: "1h 45min"
 *               progreso:
 *                 curso: "Cálculo y Estadística"
 *                 porcentaje: 65
 *               tasaRepeticion:
 *                 - tema: "Derivadas"
 *                   repeticiones: 4
 *                 - tema: "Probabilidad"
 *                   repeticiones: 2
 *       401:
 *         description: Token no proporcionado o inválido.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/estadisticas', authMiddleware, estudianteController.obtenerEstadisticas);

module.exports = router;

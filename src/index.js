// src/index.js (VERSIÓN FINAL Y COMPLETA CON SWAGGER)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. IMPORTACIÓN DE TODAS LAS RUTAS
const authRoutes = require('./routes/authRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const temaRoutes = require('./routes/temaRoutes'); 
const leccionRoutes = require('./routes/leccionRoutes');
const tiendaRoutes = require('./routes/tiendaRoutes');
const personajeRoutes = require('./routes/personajeRoutes'); 
const rankingRoutes = require('./routes/rankingRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes'); 
const inventarioRoutes = require('./routes/inventarioRoutes');
const institucionesRoutes = require('./routes/institucionesRoutes');
const ciclosRoutes = require('./routes/ciclosRoutes');
const quizRoutes = require('./routes/quizRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const progresoRoutes = require('./routes/progresoRoutes');
const adminRoutes = require('./routes/adminRoutes');


// --- 1.A. IMPORTACIÓN DE SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1.B. CONFIGURACIÓN DE SWAGGER (AJUSTADA) ---
const swaggerOptions = {
  // "definition" contiene la información base de la API
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Llama Matemática API',
      version: '1.0.0',
      description: 'Documentación oficial de la API para la tesis Llama Matemática.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: { // Para el botón "Authorize"
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // --- CAMBIO REALIZADO ---
    // Quitamos la seguridad global para definirla en cada ruta que SÍ la necesite.
    // security: [ { bearerAuth: [], } ], 
  },
  // "apis" le dice a swagger-jsdoc dónde buscar los comentarios.
  apis: ['./src/routes/*.js'], 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
// --- FIN DEL BLOQUE SWAGGER ---


// 2. MIDDLEWARES ESENCIALES
app.use(cors()); 
app.use(express.json()); 

// 3. DEFINICIÓN DE TODOS LOS ENDPOINTS
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/temas', temaRoutes);
app.use('/api/lecciones', leccionRoutes);
app.use('/api/tienda', tiendaRoutes);
app.use('/api/personajes', personajeRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/estudiante', estudianteRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/instituciones', institucionesRoutes);
app.use('/api/ciclos', ciclosRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/admin', adminRoutes);

// 4. INICIAR EL SERVIDOR
// --- 4.A. RUTA DE LA DOCUMENTACIÓN ---
// Sirve la página de Swagger en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 4.B. INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
});

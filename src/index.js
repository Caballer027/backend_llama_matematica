// src/index.js (VERSIÓN FINAL CORREGIDA + BIGINT FIX)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 

// 🔥 TRUCO MAESTRO: Enseñar a JSON cómo leer BigInts
// Esto soluciona el error "Do not know how to serialize a BigInt" en TODO el proyecto.
// Convierte los IDs gigantes (ej: 9007199254740991n) a string ("9007199254740991") automáticamente.
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// 1. IMPORTACIÓN DE RUTAS
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
const carreraRoutes = require('./routes/carreraRoutes');
const ciclosRoutes = require('./routes/ciclosRoutes');
const quizRoutes = require('./routes/quizRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const progresoRoutes = require('./routes/progresoRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --- SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Llama Matemática API',
      version: '1.0.0',
      description: 'Documentación oficial de la API.',
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Servidor Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// -----------------------------------------
// 2. MIDDLEWARES
// -----------------------------------------

app.use(cors({
  origin: 'http://localhost:5173', // Tu Frontend
  credentials: true
}));

app.use(express.json());

// 🔥 HABILITAR CARPETA PÚBLICA DE IMÁGENES
// 1. Apuntamos a la carpeta '../public' porque ahí es donde se guardan tus fotos.
// 2. No ponemos prefijo ('/uploads') para que la URL sea directa: localhost:3000/historias/foto.jpg
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------------------
// 3. RUTAS
// -----------------------------------------

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
app.use('/api/carreras', carreraRoutes);
app.use('/api/ciclos', ciclosRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/admin', adminRoutes);

// -----------------------------------------
// 4. INICIAR SERVIDOR
// -----------------------------------------

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Swagger disponible en http://localhost:${PORT}/api-docs`);
  // Mensaje para confirmar que la carpeta public está activa
  console.log(`🖼️  Archivos estáticos servidos desde: ${path.join(__dirname, '../public')}`);
});
// src/controllers/feedbackController.js
const prisma = require('../prismaClient');

// (Definición de Swagger eliminada de aquí)

exports.getFeedbackById = async (req, res) => {
  // ✅ CORRECCIÓN: Los IDs ahora son BigInt
  const feedbackId = BigInt(req.params.id);
  const usuarioId = BigInt(req.usuario.id); 

  try {
    // 1. Buscamos el reporte de feedback principal (usando BigInt)
    const feedback = await prisma.feedback_ia.findUnique({
      where: { id: feedbackId },
      include: {
        progreso_lecciones_usuario: {
          select: { usuario_id: true } // usuario_id también es BigInt
        }
      }
    });

    // 2. Validar que exista y que pertenezca al usuario (comparando BigInt con BigInt)
    if (!feedback || feedback.progreso_lecciones_usuario.usuario_id !== usuarioId) {
      return res.status(404).json({ error: 'Reporte de feedback no encontrado o no autorizado.' });
    }

    // 3. Buscamos los errores específicos asociados (usando BigInt)
    const errores = await prisma.error_ejercicio.findMany({
      where: { feedback_id: feedbackId },
      include: {
        pregunta: { 
          select: { enunciado_pregunta: true }
        }
      }
    });

    // 4. Formateamos la respuesta
    const respuesta = {
      // ✅ CORRECCIÓN: Convertimos el BigInt a String para JSON
      id: feedback.id.toString(), 
      fecha_generacion: feedback.fecha_generacion,
      resumen: feedback.contenido_feedback, 
      
      errores_detalle: errores.map(error => ({
        enunciado_pregunta: error.pregunta.enunciado_pregunta,
        analisis: error.detalle_json.analisis,
        consejo: error.detalle_json.consejo
      }))
    };
    
    // 5. Enviamos el JSON limpio
    res.json(respuesta);

  } catch (error) {
    console.error('❌ Error al obtener el feedback:', error);
    res.status(500).json({ error: 'Error interno al obtener el reporte de feedback.' });
  }
};
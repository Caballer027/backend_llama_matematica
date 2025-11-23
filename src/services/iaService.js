// src/services/iaService.js (ACTUALIZADO PARA EL PLAN DE 13 PUNTOS)
const axios = require('axios');
const prisma = require('../prismaClient');

const OLLAMA_API_URL = 'http://localhost:1234/v1/chat/completions';

/**
 * @param {Array<Object>} preguntasFalladas - Un array de objetos de pregunta de Prisma.
 */
exports.generarFeedback = async (preguntasFalladas) => {
  try {
    console.log(`🧠 Iniciando generación de feedback LOCAL para ${preguntasFalladas.length} preguntas falladas.`);

    if (preguntasFalladas.length === 0) {
      console.log('✅ El usuario no tuvo errores. No se generará feedback.');
      return null;
    }

    // Convertimos las preguntas a un formato simple para el prompt
    const listaEnunciados = preguntasFalladas.map((pregunta, index) => {
      return `Ejercicio ${index + 1}: { "id": ${pregunta.id}, "enunciado": "${pregunta.enunciado_pregunta}" }`;
    }).join('\n');

    const prompt = `
      Eres un tutor de matemáticas experto y amigable llamado "Khipu".
      Un estudiante acaba de fallar en varios ejercicios.
      
      Lista de ejercicios fallados (con su ID y enunciado):
      ${listaEnunciados}

      Tu tarea es generar un feedback constructivo. Responde SOLAMENTE con un objeto JSON válido, sin texto introductorio, explicaciones, ni la palabra "json".
      El objeto JSON debe tener esta estructura exacta:
      {
        "puntosFuertes": ["Un string elogiando el esfuerzo o un área que sí dominó (ej. '¡Gran esfuerzo! Se nota que entiendes el planteamiento inicial.')"],
        "areasMejora": ["Un string identificando el patrón de error principal (ej. 'He notado que el principal desafío está en el despeje de variables...')"],
        "consejosPracticos": ["Un array de 2 o 3 strings con consejos generales (ej. 'Revisa el orden de las operaciones (PEMDAS)', 'Practica con 5 ejercicios más de este tipo.')"],
        "ejercicios_fallados": [
          {
            "ejercicio_id": <ID_DEL_EJERCICIO_1>,
            "analisis": "Un análisis breve de por qué se pudo haber fallado este ejercicio específico (ej. 'Aquí, el error común es olvidar distribuir el signo negativo a ambos términos dentro del paréntesis.')",
            "consejo": "Un consejo puntual para este tipo de ejercicio (ej. 'Recuerda: ¡un signo puede cambiar todo el resultado!')"
          },
          {
            "ejercicio_id": <ID_DEL_EJERCICIO_2>,
            "analisis": "...",
            "consejo": "..."
          }
        ]
      }
    `;

    const response = await axios.post(OLLAMA_API_URL, {
      model: 'meta-llama-3-8b-instruct', // Asegúrate que este sea el ID de tu modelo en LM Studio
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
    });

    const responseText = response.data.choices[0].message.content;
    const jsonResponse = JSON.parse(responseText.trim());

    console.log('🤖 Feedback complejo generado por la IA LOCAL:', jsonResponse);
    return jsonResponse;

  } catch (error) {
    console.error('❌ Error detallado al generar feedback con la IA LOCAL:', error.response ? error.response.data : error.message);
    throw new Error('No se pudo generar el feedback.');
  }
};
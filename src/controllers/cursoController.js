// src/controllers/cursoController.js (ACTUALIZADO CON LÓGICA DE CICLOS)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/cursos
// --- CAMBIO: Lógica de bloqueo de cursos ---
exports.getAllCursos = async (req, res) => {
  try {
    const usuarioId = Number(req.usuario.id);

    // 1. Obtener el ciclo y rol del usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { 
        ciclo_actual_id: true, 
        rol_id: true 
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 2. Verificar si es Administrador
    const rol = await prisma.roles.findUnique({ where: { id: usuario.rol_id } });
    const esAdmin = rol && rol.nombre_rol === 'Administrador';

    // 3. Obtener el ciclo del usuario (ID)
    // Asumimos que los IDs de ciclo son 1, 2, 3... y un ID mayor significa un ciclo posterior
    const cicloUsuarioId = usuario.ciclo_actual_id; 

    // 4. Obtener todos los cursos
    const cursos = await prisma.cursos.findMany({
      orderBy: {
        ciclo_id: 'asc', // Ordenar por ciclo
      }
    });

    // 5. Mapear cursos y añadir el estado de bloqueo
    const cursosConBloqueo = cursos.map(curso => {
      let esta_bloqueado = true;

      if (esAdmin) {
        // Si es Admin, desbloquear todo
        esta_bloqueado = false;
      } else if (!cicloUsuarioId) {
        // Si el usuario no tiene ciclo asignado, bloquear todo por defecto
        esta_bloqueado = true;
      } else {
        // Lógica de bloqueo principal:
        // Un curso está bloqueado si su ID de ciclo es MAYOR que el ID de ciclo del usuario.
        esta_bloqueado = curso.ciclo_id > cicloUsuarioId;
      }

      return {
        ...curso,
        esta_bloqueado: esta_bloqueado,
      };
    });

    res.json(cursosConBloqueo);

  } catch (error) {
    console.error('❌ Error al obtener los cursos con lógica de bloqueo:', error);
    res.status(500).json({ error: 'Error al obtener los cursos.' });
  }
};

// GET /api/cursos/:id (Sin cambios)
exports.getCursoById = async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await prisma.cursos.findUnique({
      where: { id: Number(id) },
      include: {
        temas: { // Incluye los temas relacionados
          orderBy: { orden: 'asc' },
          include: {
            lecciones: { // Y dentro de cada tema, incluye sus lecciones
              orderBy: { orden: 'asc' },
              select: { // Solo seleccionamos los campos que necesitamos para la lista
                id: true,
                titulo_leccion: true,
                orden: true
              }
            }
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado.' });
    }
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el curso.' });
  }
};

// GET /api/cursos/:id/temario (Sin cambios)
exports.getTemarioPorCurso = async (req, res) => {
  const cursoId = Number(req.params.id);

  try {
    // 1. Buscamos el curso y sus temas (como ya lo hacías)
    const cursoConTemario = await prisma.cursos.findUnique({
      where: {
        id: cursoId,
      },
      include: {
        temas: {
          orderBy: {
            orden: 'asc',
          },
          select: {
            id: true,
            nombre_tema: true,
            orden: true,
          },
        },
      },
    });

    if (!cursoConTemario) {
      return res.status(404).json({ error: 'Curso no encontrado.' });
    }

    // 2. --- ¡LA TRANSFORMACIÓN! ---
    // Mapeamos los resultados para añadir el campo "semana"
    const temarioTransformado = cursoConTemario.temas.map(tema => {
      return {
        id: tema.id,
        nombre_tema: tema.nombre_tema,
        orden: tema.orden,
        semana: `SEM ${tema.orden}` // <-- ¡AQUÍ ESTÁ EL CAMPO QUE QUIERES!
      };
    });
    // ----------------------------

    // 3. Devolvemos el JSON transformado
    res.json(temarioTransformado);

  } catch (error) {
    console.error('❌ Error al obtener el temario del curso:', error);
    res.status(500).json({ error: 'Error al obtener el temario del curso.' });
  }
};
// src/controllers/cursoController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// GET /api/cursos
// Lógica original + incluye Profesor como desbloqueado
// ============================================================
exports.getAllCursos = async (req, res) => {
  try {
    const usuarioId = Number(req.usuario.id);

    // 1. Obtener ciclo y rol
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

    // 2. Verificar si es Admin o Profesor
    const rol = await prisma.roles.findUnique({
      where: { id: usuario.rol_id }
    });

    const esAdmin =
      rol &&
      (rol.nombre_rol === 'Administrador' ||
        rol.nombre_rol === 'Profesor'); // PROFES TAMBIÉN VEN TODO

    // 3. Ciclo actual del usuario
    const cicloUsuarioId = usuario.ciclo_actual_id;

    // 4. Obtener cursos
    const cursos = await prisma.cursos.findMany({
      orderBy: { ciclo_id: 'asc' }
    });

    // 5. Evaluar bloqueo
    const cursosConBloqueo = cursos.map(curso => {
      let esta_bloqueado = true;

      if (esAdmin) esta_bloqueado = false; 
      else if (!cicloUsuarioId) esta_bloqueado = true;
      else esta_bloqueado = curso.ciclo_id > cicloUsuarioId;

      return { ...curso, esta_bloqueado };
    });

    res.json(cursosConBloqueo);

  } catch (error) {
    console.error('❌ Error cursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

// ============================================================
// GET /api/cursos/:id
// (Tu función original)
// ============================================================
exports.getCursoById = async (req, res) => {
  const { id } = req.params;

  try {
    const curso = await prisma.cursos.findUnique({
      where: { id: Number(id) },
      include: {
        temas: {
          orderBy: { orden: 'asc' },
          include: {
            lecciones: {
              orderBy: { orden: 'asc' },
              select: { id: true, titulo_leccion: true, orden: true }
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
    res.status(500).json({ error: 'Error al obtener curso' });
  }
};

// ============================================================
// GET /api/cursos/:id/temario
// (Tu función original con campo SEMANA)
// ============================================================
exports.getTemarioPorCurso = async (req, res) => {
  const cursoId = Number(req.params.id);

  try {
    const curso = await prisma.cursos.findUnique({
      where: { id: cursoId },
      include: {
        temas: {
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            nombre_tema: true,
            orden: true
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado.' });
    }

    const temario = curso.temas.map(tema => ({
      id: tema.id,
      nombre_tema: tema.nombre_tema,
      orden: tema.orden,
      semana: `SEM ${tema.orden}`
    }));

    res.json(temario);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener temario' });
  }
};

// ============================================================
// CRUD COMPLETO PARA ADMIN / PROFESOR
// ============================================================

// CREATE - POST /api/cursos
exports.createCurso = async (req, res) => {
  const { nombre_curso, descripcion, ciclo_id } = req.body;

  if (!nombre_curso || !ciclo_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const nuevo = await prisma.cursos.create({
      data: {
        nombre_curso,
        descripcion,
        ciclo_id: Number(ciclo_id)
      }
    });

    res.status(201).json(nuevo);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un curso con ese nombre en este ciclo' });
    }
    res.status(500).json({ error: 'Error al crear curso' });
  }
};

// UPDATE - PUT /api/cursos/:id
exports.updateCurso = async (req, res) => {
  const { id } = req.params;
  const { nombre_curso, descripcion, ciclo_id } = req.body;

  try {
    const actualizado = await prisma.cursos.update({
      where: { id: Number(id) },
      data: {
        nombre_curso,
        descripcion,
        ciclo_id: Number(ciclo_id)
      }
    });

    res.json(actualizado);

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
};

// DELETE - DELETE /api/cursos/:id
exports.deleteCurso = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cursos.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Curso eliminado' });

  } catch (error) {
    res.status(500).json({ error: 'No se puede eliminar (tiene temas asociados)' });
  }
};

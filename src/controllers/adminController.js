// ============================================================
// src/controllers/adminController.js — FINAL V22 (Timezone Fixed)
// ============================================================
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

// ============================================================
// 📊 DASHBOARD (KPIs Rápidos + Bitácora de Actividad)
// ============================================================
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. KPIs BÁSICOS
    const [totalEstudiantes, totalProfesores, totalLecciones, ventasTienda] =
      await prisma.$transaction([
        prisma.usuarios.count({ where: { rol: { nombre_rol: 'Estudiante' } } }),
        prisma.usuarios.count({ where: { rol: { nombre_rol: 'Profesor' } } }),
        prisma.lecciones.count(),
        prisma.inventario_usuario.count(),
      ]);

    // 2. HISTORIAL DE ACTIVIDAD (Últimas 50 sesiones)
    const historialRaw = await prisma.quiz_session.findMany({
      take: 50,
      orderBy: { fecha_inicio: 'desc' },
      include: {
        usuario: {
          select: { nombre: true, apellido: true, correo_electronico: true }
        },
        leccion: {
          select: {
            titulo_leccion: true,
            temas: {
              select: {
                cursos: { select: { nombre_curso: true } }
              }
            }
          }
        }
      }
    });

    const activityLog = historialRaw.map((h) => ({
      id: h.id.toString(),
      alumno: h.usuario ? `${h.usuario.nombre} ${h.usuario.apellido}` : 'Usuario Eliminado',
      correo: h.usuario ? h.usuario.correo_electronico : 'N/A',
      curso: h.leccion?.temas?.cursos?.nombre_curso || 'Curso General',
      leccion: h.leccion?.titulo_leccion || 'Lección desconocida',
      nota: h.puntaje_obtenido,
      gemas: h.gemas_obtenidas,
      xp: h.xp_obtenida || 0,
      fecha: h.fecha_inicio
    }));

    res.json({
      metrics: {
        estudiantes: totalEstudiantes,
        profesores: totalProfesores,
        lecciones: totalLecciones,
        ventas: ventasTienda,
      },
      activityLog: activityLog
    });

  } catch (error) {
    console.error('Error getDashboardStats:', error);
    res.status(500).json({ error: 'Error stats dashboard' });
  }
};

// ============================================================
// 📈 ANALÍTICAS (Corregido: Zona Horaria Perú)
// ============================================================
exports.getAnalytics = async (req, res) => {
  try {
    const sesiones = await prisma.quiz_session.findMany({
      select: {
        puntaje_obtenido: true,
        fecha_inicio: true,
        gemas_obtenidas: true,
        leccion: {
          select: {
            titulo_leccion: true,
            temas: {
              select: {
                nombre_tema: true,
                orden: true,
                cursos: { select: { nombre_curso: true } },
              },
            },
          },
        },
      },
    });

    // A. ACTIVIDAD (Sincronizada con America/Lima)
    const actividadMap = {};
    
    // 1. Generar los últimos 7 días con fecha local de Perú
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // 'en-CA' devuelve formato YYYY-MM-DD, ideal para ordenar
      const fechaLocal = d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
      actividadMap[fechaLocal] = 0;
    }

    // 2. Clasificar sesiones convirtiendo su fecha UTC a Perú
    sesiones.forEach((s) => {
      if (!s.fecha_inicio) return;
      
      // Convertir la fecha de la BD a hora Perú antes de extraer el día
      const fechaPeru = s.fecha_inicio.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

      // Solo contar si entra en el rango de los últimos 7 días
      if (actividadMap.hasOwnProperty(fechaPeru)) {
        actividadMap[fechaPeru] += 1;
      }
    });

    const graficoLinea = Object.keys(actividadMap)
      .map((f) => ({ fecha: f, intentos: actividadMap[f] }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // B. FILTROS CURSOS
    const sesionesC1 = sesiones.filter(
      (s) =>
        s.leccion?.temas?.cursos?.nombre_curso &&
        s.leccion.temas.cursos.nombre_curso.toLowerCase().includes('cálculo') &&
        !s.leccion.temas.cursos.nombre_curso.toLowerCase().includes('aplicaciones')
    );
    const sesionesC2 = sesiones.filter(
      (s) =>
        s.leccion?.temas?.cursos?.nombre_curso &&
        s.leccion.temas.cursos.nombre_curso.toLowerCase().includes('aplicaciones')
    );

    // C. PASTELES
    const calcAprobacion = (lista) => {
      const total = lista.length;
      if (total === 0) return [{ name: 'Sin Datos', value: 1 }];
      const aprobados = lista.filter((x) => x.puntaje_obtenido >= 13).length;
      const reprobados = total - aprobados;
      return [
        { name: 'Aprobados', value: aprobados, fill: '#10B981' },
        { name: 'Reprobados', value: reprobados, fill: '#EF4444' },
      ];
    };
    const pasteles = {
      general: calcAprobacion(sesiones),
      curso1: calcAprobacion(sesionesC1),
      curso2: calcAprobacion(sesionesC2),
    };

    // D. TOP 5
    const notasPorLeccion = {};
    sesiones.forEach((s) => {
      const titulo = s.leccion?.titulo_leccion || 'Sin título';
      if (!notasPorLeccion[titulo]) notasPorLeccion[titulo] = { sum: 0, count: 0 };
      notasPorLeccion[titulo].sum += s.puntaje_obtenido || 0;
      notasPorLeccion[titulo].count++;
    });
    const ranking = Object.keys(notasPorLeccion)
      .map((t) => ({
        name: t,
        promedio: parseFloat((notasPorLeccion[t].sum / notasPorLeccion[t].count).toFixed(1)),
      }))
      .sort((a, b) => b.promedio - a.promedio);

    const tops = {
      mejores: ranking.slice(0, 5),
      peores: ranking.slice(-5).reverse(),
    };

    // E. SEMANAL
    const calcSemanal = (lista) => {
      const notasTema = {};
      lista.forEach((s) => {
        const tema = s.leccion?.temas;
        if (!tema) return;
        const label = `S${tema.orden}`;
        if (!notasTema[label])
          notasTema[label] = {
            sum: 0, count: 0, orden: tema.orden, nombreReal: tema.nombre_tema, sumTiempo: 0,
          };
        notasTema[label].sum += s.puntaje_obtenido || 0;
        notasTema[label].sumTiempo += s.puntaje_obtenido > 15 ? 10 : s.puntaje_obtenido > 10 ? 15 : 20;
        notasTema[label].count++;
      });
      return Object.keys(notasTema)
        .map((k) => ({
          semana: k,
          temaFull: notasTema[k].nombreReal,
          promedio: parseFloat((notasTema[k].sum / notasTema[k].count).toFixed(1)),
          tiempoProm: Math.round(notasTema[k].sumTiempo / notasTema[k].count),
          orden: notasTema[k].orden,
        }))
        .sort((a, b) => a.orden - b.orden);
    };
    const semanal = { curso1: calcSemanal(sesionesC1), curso2: calcSemanal(sesionesC2) };

    // F. KPIs (Riesgo y Excelencia)
    const promediosAlumnos = await prisma.progreso_lecciones_usuario.groupBy({
      by: ['usuario_id'],
      _avg: { puntaje_total: true },
    });
    const alumnosRiesgoCount = promediosAlumnos.filter((p) => p._avg.puntaje_total < 13).length;
    const excelenciaAcademica = promediosAlumnos.filter((p) => p._avg.puntaje_total > 17).length;

    res.json({
      graficoLinea,
      pasteles,
      tops,
      semanal,
      stats: { alumnosRiesgoCount, excelenciaAcademica },
    });
  } catch (error) {
    console.error('Error getAnalytics:', error);
    res.status(500).json({ error: 'Error analytics' });
  }
};

// ============================================================
// 📊 REPORTES AVANZADOS (Filtros Reales desde DB)
// ============================================================
exports.getAdvancedReports = async (req, res) => {
  try {
    // 1. OBTENER LISTAS MAESTRAS PARA FILTROS (Independiente de si hay notas o no)
    // Esto soluciona el problema de que los cursos nuevos no aparecían
    const [allInstituciones, allCarreras, allCursos, rawData] = await prisma.$transaction([
      prisma.institucion.findMany({ select: { id: true, nombre: true } }),
      prisma.carrera.findMany({ select: { id: true, nombre: true } }),
      prisma.cursos.findMany({ select: { id: true, nombre_curso: true } }), // 🔥 LISTA REAL DE CURSOS
      
      // Datos de estudiantes para la tabla
      prisma.usuarios.findMany({
        where: { rol: { nombre_rol: 'Estudiante' } },
        include: {
          institucion: { select: { nombre: true } },
          carrera: { select: { nombre: true } },
          // Relación correcta para saber el curso/ciclo
          // Asumiendo que 'ciclo_actual' o 'carrera' define el curso indirectamente, 
          // O si tienes una relación directa usuario->curso. 
          // Basado en tu seed, usas 'ciclo_actual_id'.
          ciclo_actual: { select: { nombre: true } }, 
          progreso_lecciones_usuario: { select: { puntaje_total: true } },
        },
      })
    ]);

    // Procesar datos de estudiantes
    const reporteEstudiantes = rawData.map((u) => {
      const total = u.progreso_lecciones_usuario.length;
      const suma = u.progreso_lecciones_usuario.reduce(
        (a, c) => a + c.puntaje_total,
        0
      );
      const prom = total ? (suma / total).toFixed(1) : 0;
      let nivel = 'Inactivo';
      if (total > 0) {
        if (prom >= 17) nivel = 'Sobresaliente 🌟';
        else if (prom >= 13) nivel = 'Bueno ✅';
        else if (prom >= 11) nivel = 'Regular ⚠️';
        else nivel = 'En Riesgo 🆘';
      }
      
      // Determinar Curso basado en ciclo (Lógica de negocio simple para visualización)
      // Ajusta esto según tu lógica real de asignación
      let cursoNombre = 'Sin Asignar';
      if (u.ciclo_actual?.nombre?.toLowerCase().includes('primer')) cursoNombre = 'Cálculo y Estadística';
      if (u.ciclo_actual?.nombre?.toLowerCase().includes('segundo')) cursoNombre = 'Aplicaciones de Cálculo y Estadística';

      return {
        id: u.id.toString(),
        nombre: `${u.nombre} ${u.apellido}`,
        institucion: u.institucion?.nombre || 'Sin Inst.',
        carrera: u.carrera?.nombre || 'Sin Carrera',
        ciclo: u.ciclo_actual?.nombre || 'Sin Ciclo',
        curso_asignado: cursoNombre, // Campo extra para filtro frontend si se desea
        lecciones_completadas: total,
        promedio_global: Number(prom),
        nivel_rendimiento: nivel,
      };
    });

    // Gráfica Instituciones (Calculada solo con data existente)
    const mapInst = {};
    rawData.forEach((u) => {
      const inst = u.institucion?.nombre || 'Otros';
      if (!mapInst[inst]) mapInst[inst] = { nombre: inst, sum: 0, count: 0 };
      const notas = u.progreso_lecciones_usuario.map((p) => p.puntaje_total);
      if (notas.length > 0) {
        mapInst[inst].sum += notas.reduce((a, b) => a + b, 0) / notas.length;
        mapInst[inst].count++;
      }
    });
    const graficoInstituciones = Object.values(mapInst).map((i) => ({
      nombre: i.nombre,
      promedio: i.count ? Number((i.sum / i.count).toFixed(1)) : 0,
      alumnos: i.count,
    }));

    // Formatear listas para el frontend
    const listaInstituciones = allInstituciones.map(i => ({ id: i.id.toString(), nombre: i.nombre }));
    const listaCarreras = allCarreras.map(c => ({ id: c.id.toString(), nombre: c.nombre }));
    const listaCursos = allCursos.map(c => ({ id: c.id.toString(), nombre: c.nombre_curso }));

    res.json({
      estudiantes: reporteEstudiantes,
      instituciones: graficoInstituciones,
      // Enviamos las listas maestras para los filtros
      listas: {
        instituciones: listaInstituciones,
        carreras: listaCarreras,
        cursos: listaCursos
      }
    });
  } catch (error) {
    console.error('Error getAdvancedReports:', error);
    res.status(500).json({ error: 'Error reportes avanzados' });
  }
};

// ============================================================
// 👥 USUARIOS (CRUD simplificado y consistente V18)
// ============================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuarios.findMany({ include: { rol: true } });
    res.json(users.map((u) => ({ ...u, id: u.id.toString(), rol: u.rol?.nombre_rol })));
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ error: 'Error al listar usuarios.' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: BigInt(id) },
      include: { rol: true, personaje_activo: true, institucion: true, carrera: true },
    });
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ...user, id: user.id.toString(), rol: user.rol?.nombre_rol });
  } catch (error) {
    console.error('Error getUserById:', error);
    res.status(500).json({ error: 'Error detalle usuario.' });
  }
};

// ============================================================
// 👨‍🏫 PROFESORES
// ============================================================
exports.getAllProfessors = async (req, res) => {
  try {
    const profesores = await prisma.usuarios.findMany({
      where: { rol: { nombre_rol: 'Profesor' } },
      include: { institucion: true, cursos_que_dicta: { include: { curso: true } } },
    });
    res.json(
      profesores.map((p) => ({
        id: p.id.toString(),
        nombre_completo: `${p.nombre} ${p.apellido}`,
        correo: p.correo_electronico,
        institucion: p.institucion?.nombre || 'N/A',
        cursos: p.cursos_que_dicta.map((r) => r.curso.nombre_curso).join(', ') || 'Ninguno',
      }))
    );
  } catch (error) {
    console.error('Error getAllProfessors:', error);
    res.status(500).json({ error: 'Error' });
  }
};

exports.createProfessor = async (req, res) => {
  const { nombre, apellido, correo_electronico, contrasena, institucion_id } = req.body;
  try {
    const existe = await prisma.usuarios.findUnique({ where: { correo_electronico } });
    if (existe) return res.status(409).json({ error: 'Correo ya existe' });

    const hashed = await bcrypt.hash(contrasena, 10);
    const rolProfe = await prisma.roles.findFirst({ where: { nombre_rol: 'Profesor' } });

    const nuevo = await prisma.usuarios.create({
      data: {
        nombre,
        apellido,
        correo_electronico,
        hash_contrasena: hashed,
        rol_id: rolProfe.id,
        institucion_id: institucion_id ? Number(institucion_id) : null,
        gemas: 0,
        puntos_experiencia: 0,
      },
    });

    res.status(201).json({ message: 'Creado', id: nuevo.id.toString() });
  } catch (error) {
    console.error('Error createProfessor:', error);
    res.status(500).json({ error: 'Error' });
  }
};

exports.assignCourseToProfessor = async (req, res) => {
  const { profesor_id, curso_id } = req.body;
  try {
    await prisma.profesor_curso.create({
      data: { usuario_id: BigInt(profesor_id), curso_id: Number(curso_id) },
    });
    res.json({ message: 'Asignado' });
  } catch (error) {
    console.error('Error assignCourseToProfessor:', error);
    res.status(400).json({ error: 'Error' });
  }
};

// ============================================================
// 🎓 ESTUDIANTES
// ============================================================
exports.getEstudiantes = async (req, res) => {
  try {
    const estudiantes = await prisma.usuarios.findMany({
      where: { rol: { nombre_rol: 'Estudiante' } },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo_electronico: true,
        gemas: true,
        puntos_experiencia: true,
      },
    });
    res.json(estudiantes.map((e) => ({ ...e, id: e.id.toString() })));
  } catch (error) {
    console.error('Error getEstudiantes:', error);
    res.status(500).json({ error: 'Error' });
  }
};

// ============================================================
// 🗑️ ELIMINAR USUARIO
// ============================================================
exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Protección: evita que un admin se elimine a sí mismo si req.usuario está presente
    if (req.usuario && String(req.usuario.id) === String(id)) {
      return res.status(400).json({ error: 'No puedes borrarte a ti mismo' });
    }
    await prisma.usuarios.delete({ where: { id: BigInt(id) } });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    console.error('Error deleteUsuario:', error);
    res.status(500).json({ error: 'Error' });
  }
};
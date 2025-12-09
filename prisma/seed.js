const { PrismaClient, preguntas_tipo_pregunta } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// --------------------- LISTAS ---------------------
const carrerasNombres = [
  'Administración y Emprendimiento de Negocios Digitales', 'Marketing Digital Analítico', 'Diseño Industrial',
  'Tecnología de la Producción', 'Producción y Gestión Industrial', 'Logística Digital Integrada',
  'Topografía y Geomática', 'Procesos Químicos y Metalúrgicos', 'Operaciones Mineras',
  'Operación de Plantas de Procesamiento de Minerales', 'Gestión de Seguridad y Salud en el Trabajo',
  'Mantenimiento de Equipo Pesado', 'Mecatrónica y Gestión Automotriz', 'Gestión y Mantenimiento de Maquinaria Pesada',
  'Aviónica y Mecánica Aeronáutica', 'Mantenimiento y Gestión de Plantas Industriales', 'Tecnología Mecánica Eléctrica',
  'Ciberseguridad y Auditoría Informática', 'Diseño y Desarrollo de Software', 'Diseño y Desarrollo de Simuladores y Videojuegos',
  'Administración de Redes y Comunicaciones', 'Big Data y Ciencia de Datos', 'Modelado y Animación Digital'
];

const temasCiclo1 = [
  'Ecuaciones lineales', 'Ecuaciones cuadráticas', 'Sistemas de ecuaciones lineales',
  'Aplicaciones de la geometría del espacio I', 'Plano cartesiano y ecuación de la recta',
  'Proporcionalidad', 'Resolución de triángulos', 'Aplicaciones de la geometría del espacio II',
  'Función lineal y cuadrática', 'Función exponencial y logarítmica', 'Función seno y coseno',
  'Función por tramos', 'Estadística: conceptos básicos', 'Estadística: medidas estadísticas I',
  'Estadística: medidas estadísticas II', 'Taller de estadística'
];

const temasCiclo2 = [
  'Derivadas: noción de límite', 'Recta tangente y derivación implícita', 'Razón de cambio',
  'Derivada de una función y aplicaciones', 'Linealización y diferenciales', 'Criterio de la primera y segunda derivada',
  'Optimización', 'Taller de problemas: Diferenciales', 'Integral indefinida', 'Integral definida y áreas',
  'Volumen de sólido de revolución', 'Área de superficie de sólido', 'Probabilidad clásica',
  'Probabilidad total y Bayes', 'Variable aleatoria continua', 'Distribución normal'
];

const generarPasos = (tipo) => JSON.stringify([
  { paso: 1, titulo: 'Datos', texto: `Identifica las variables en el problema de ${tipo}.` },
  { paso: 2, titulo: 'Fórmula', texto: 'Selecciona la fórmula matemática adecuada.' },
  { paso: 3, titulo: 'Cálculo', texto: 'Realiza las operaciones paso a paso.' },
  { paso: 4, titulo: 'Revisión', texto: 'Verifica las unidades y el resultado.' }
]);

// =====================================================
// ====================== MAIN =========================
// =====================================================

async function main() {
  console.log('☢️  REINICIANDO BASE DE DATOS A CERO (IDs = 1)...');

  // Reiniciar todas las tablas
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
      } catch {
        console.log(`- Tabla ${tablename} ya estaba limpia.`);
      }
    }
  }

  console.log('🏗️  Creando estructura base...');

  // Roles
  const rolAdmin = await prisma.roles.create({ data: { nombre_rol: 'Administrador' } });
  const rolProfe = await prisma.roles.create({ data: { nombre_rol: 'Profesor' } });
  const rolEstudiante = await prisma.roles.create({ data: { nombre_rol: 'Estudiante' } });

  // Institución
  const tecsup = await prisma.institucion.create({
    data: { nombre: 'Tecsup', dominio_correo: 'tecsup.edu.pe' }
  });

  // Carreras
  const carrerasMap = [];
  for (const nombre of carrerasNombres) {
    carrerasMap.push(
      await prisma.carrera.create({ data: { nombre, institucion_id: tecsup.id } })
    );
  }

  // Ciclos
  const c1 = await prisma.ciclo.create({ data: { nombre: 'Primer ciclo', numero: 1 } });
  const c2 = await prisma.ciclo.create({ data: { nombre: 'Segundo ciclo', numero: 2 } });

  // Personajes
  const ignix = await prisma.personajes.create({
    data: {
      nombre: 'IGNIX', asset_key: 'HIPOPOTAMO',
      url_imagen_base: '/assets/1764409428460-339805880.png',
      mensaje_corta: 'La lógica fluye mejor cuando respiras hondo.',
      mensaje_larga: '...'
    }
  });

  const brizali = await prisma.personajes.create({
    data: {
      nombre: 'BRIZALI', asset_key: 'LEON',
      url_imagen_base: '/assets/1764409447833-241918700.png',
      mensaje_corta: 'Cada problema es un rugido de logro.',
      mensaje_larga: '...'
    }
  });

  const drop = await prisma.personajes.create({
    data: {
      nombre: 'DROP', asset_key: 'CONEJO',
      url_imagen_base: '/assets/1764409438945-309720786.png',
      mensaje_corta: 'Los errores te hacen saltar más alto.',
      mensaje_larga: '...'
    }
  });

  // Tienda
  const tipoRopa = await prisma.tipos_item.create({ data: { nombre_tipo: 'Polos' } });

  const polos = [
    { n: 'Amarrillo', img: 'tienda/1764548960433-811109159.png', json: {"LEON": "tienda/1764548960434-21447297.png","CONEJO":"tienda/1764548960474-223694896.png","HIPOPOTAMO":"tienda/1764548960456-937614349.png"} },
    { n: 'Morado', img: 'tienda/1764552979694-617241036.png', json: {"LEON": "tienda/1764552979712-159647466.png","CONEJO":"tienda/1764552979705-664352024.png","HIPOPOTAMO":"tienda/1764552979695-500502729.png"} },
    { n: 'Azul noche', img: 'tienda/1764553015314-151782351.png', json: {"LEON": "tienda/1764553015340-576063104.png","CONEJO":"tienda/1764553015322-56470183.png","HIPOPOTAMO":"tienda/1764553015314-73959245.png"} },
    { n: 'Rosa', img: 'tienda/1764553052501-737603323.png', json: {"LEON": "tienda/1764553052522-903394442.png","CONEJO":"tienda/1764553052507-938425006.png","HIPOPOTAMO":"tienda/1764553052501-810820446.png"} },
    { n: 'Blanco con Naranja', img: 'tienda/1764553080953-668189494.png', json: {"LEON": "tienda/1764553080966-502952164.png","CONEJO":"tienda/1764553080959-908270914.png","HIPOPOTAMO":"tienda/1764553080954-891845424.png"} },
    { n: 'Blanco con Rosado', img: 'tienda/1764553103170-649252511.png', json: {"LEON": "tienda/1764553103184-816405643.png","CONEJO":"tienda/1764553103178-766152569.png","HIPOPOTAMO":"tienda/1764553103170-950828294.png"} }
  ];

  for (const [i, p] of polos.entries()) {
    await prisma.items.create({
      data: {
        nombre_item: `Polo ${p.n}`,
        tipo_item_id: tipoRopa.id,
        costo_gemas: 250,
        url_icono_tienda: p.img,
        asset_index: i + 1,
        url_imagenes_equipado: p.json
      }
    });
  }

  const pass = await bcrypt.hash('123456', 10);
  const carreraSoft = carrerasMap.find(c => c.nombre === 'Diseño y Desarrollo de Software');

  // Admin
  await prisma.usuarios.create({
    data: {
      nombre: 'Admin', apellido: 'Sistema', correo_electronico: 'admin@tecsup.edu.pe',
      hash_contrasena: pass, rol_id: rolAdmin.id, institucion_id: tecsup.id,
      personaje_activo_id: brizali.id
    }
  });

  // Profes
  const profeJunior = await prisma.usuarios.create({
    data: {
      nombre: 'Junior', apellido: 'Amaya', correo_electronico: 'jamaya@tecsup.edu.pe',
      hash_contrasena: pass, rol_id: rolProfe.id, institucion_id: tecsup.id,
      personaje_activo_id: brizali.id
    }
  });

  const profeLuis = await prisma.usuarios.create({
    data: {
      nombre: 'Luis', apellido: 'Mallma', correo_electronico: 'lmallma@tecsup.edu.pe',
      hash_contrasena: pass, rol_id: rolProfe.id, institucion_id: tecsup.id,
      personaje_activo_id: ignix.id
    }
  });

  // Estudiantes
  const angela = await prisma.usuarios.create({
    data: {
      nombre: 'Angela', apellido: 'Baltazar', correo_electronico: 'angela.baltazar@tecsup.edu.pe',
      hash_contrasena: pass, rol_id: rolEstudiante.id, institucion_id: tecsup.id,
      carrera_id: carreraSoft.id, ciclo_actual_id: c2.id, personaje_activo_id: ignix.id,
      puntos_experiencia: 5000, gemas: 800
    }
  });

  const leo = await prisma.usuarios.create({
    data: {
      nombre: 'Leo', apellido: 'Caballero', correo_electronico: 'leo.caballero@tecsup.edu.pe',
      hash_contrasena: pass, rol_id: rolEstudiante.id, institucion_id: tecsup.id,
      carrera_id: carreraSoft.id, ciclo_actual_id: c1.id, personaje_activo_id: brizali.id,
      puntos_experiencia: 800, gemas: 100
    }
  });

  // Cursos
  const curso1 = await prisma.cursos.create({
    data: { nombre_curso: 'Cálculo y Estadística', ciclo_id: c1.id, descripcion: 'Primer ciclo.' }
  });

  const curso2 = await prisma.cursos.create({
    data: { nombre_curso: 'Aplicaciones de Cálculo y Estadística', ciclo_id: c2.id, descripcion: 'Segundo ciclo.' }
  });

  await prisma.profesor_curso.create({ data: { usuario_id: profeJunior.id, curso_id: curso1.id } });
  await prisma.profesor_curso.create({ data: { usuario_id: profeLuis.id, curso_id: curso2.id } });

  // -------------------------------------
  // CONTENIDO ACADÉMICO
  // -------------------------------------

  const leccionesIdsC1 = [];
  const leccionesIdsC2 = [];

  // Curso 1
  for (const [i, nombre] of temasCiclo1.entries()) {
    const tema = await prisma.temas.create({
      data: {
        curso_id: curso1.id, nombre_tema: nombre, orden: i + 1,
        titulo_pregunta: `Pregunta sobre ${nombre}`, url_imagen_inicio: '/assets/tema_default.png'
      }
    });

    const leccion = await prisma.lecciones.create({
      data: {
        tema_id: tema.id, titulo_leccion: `Quiz: ${nombre}`, orden: 1,
        tiempo_limite_segundos: 1200, puntos_experiencia: 100, gemas: 100
      }
    });

    leccionesIdsC1.push(leccion.id);

    for (let q = 1; q <= 4; q++) {
      await prisma.preguntas.create({
        data: {
          leccion_id: leccion.id,
          enunciado_pregunta: `Ejercicio ${q} de ${nombre} (Respuesta Numérica)`,
          tipo_pregunta: preguntas_tipo_pregunta.respuesta_abierta,
          puntos_otorgados: 5,
          respuesta_correcta_abierta: `${q * 10}`,
          pasos_guia: generarPasos(nombre)
        }
      });
    }
  }

  // Curso 2
  for (const [i, nombre] of temasCiclo2.entries()) {
    const tema = await prisma.temas.create({
      data: { curso_id: curso2.id, nombre_tema: nombre, orden: i + 1 }
    });

    const leccion = await prisma.lecciones.create({
      data: {
        tema_id: tema.id, titulo_leccion: `Evaluación: ${nombre}`, orden: 1,
        tiempo_limite_segundos: 1200, puntos_experiencia: 100, gemas: 100
      }
    });

    leccionesIdsC2.push(leccion.id);

    for (let q = 1; q <= 4; q++) {
      await prisma.preguntas.create({
        data: {
          leccion_id: leccion.id,
          enunciado_pregunta: `Problema ${q} de ${nombre}`,
          tipo_pregunta: preguntas_tipo_pregunta.respuesta_abierta,
          puntos_otorgados: 5,
          respuesta_correcta_abierta: `${q + 5}`,
          pasos_guia: generarPasos(nombre)
        }
      });
    }
  }

  console.log('📚 Contenido académico generado.');

  // ======================================
  // SIMULACIÓN (16 semanas)
  // ======================================

  console.log('🤖 Simulando actividad...');

  // ANGELA — Destacada
  for (let i = 0; i < leccionesIdsC2.length; i++) {
    const lid = leccionesIdsC2[i];
    const nota = 20;

    const prog = await prisma.progreso_lecciones_usuario.create({
      data: {
        usuario_id: angela.id, leccion_id: lid, estado: 'completado',
        puntaje_total: nota, xp_ganada: 100, gemas_ganadas: 100, intentos: 2
      }
    });

    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (16 - i));

    await prisma.quiz_session.create({
      data: {
        usuario_id: angela.id, leccion_id: lid, progreso_leccion_id: prog.id,
        tiempo_limite_segundos: 1200,
        expires_at: new Date(fecha.getTime() + 1200000),
        fecha_inicio: fecha,
        estado: 'completado',
        puntaje_obtenido: nota, xp_obtenida: 100, gemas_obtenidas: 100
      }
    });
  }

  // LEO — Riesgo / Regular
  for (let i = 0; i < leccionesIdsC1.length; i++) {
    const lid = leccionesIdsC1[i];
    const nota = i % 3 === 0 ? 8 : 12;
    const estado = nota < 13 ? 'fallido' : 'completado';

    const prog = await prisma.progreso_lecciones_usuario.create({
      data: {
        usuario_id: leo.id, leccion_id: lid, estado,
        puntaje_total: nota, xp_ganada: estado === 'completado' ? 100 : 0, intentos: 2
      }
    });

    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (16 - i));

    await prisma.quiz_session.create({
      data: {
        usuario_id: leo.id, leccion_id: lid, progreso_leccion_id: prog.id,
        tiempo_limite_segundos: 1200,
        expires_at: new Date(fecha.getTime() + 1200000),
        fecha_inicio: fecha,
        estado: 'completado',
        puntaje_obtenido: nota, xp_obtenida: estado === 'completado' ? 100 : 0
      }
    });
  }

  console.log('✅ SEED FINALIZADO. IDs reiniciados a 1. Datos completos.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());

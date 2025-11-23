// prisma/seed.js
const { PrismaClient, preguntas_tipo_pregunta } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000/images';

const temasCurso1 = [
  'Ecuaciones lineales',
  'Ecuaciones cuadráticas',
  'Sistemas de ecuaciones lineales',
  'Aplicaciones de la geometría del espacio I (prisma, cilindro, cubo)',
  'Plano cartesiano y ecuación de la recta',
  'Proporcionalidad',
  'Resolución de triángulos',
  'Aplicaciones de la geometría del espacio II (cono, pirámide, esfera)',
  'Función lineal y cuadrática',
  'Función exponencial y logarítmica',
  'Función seno y coseno',
  'Función por tramos',
  'Estadística: conceptos básicos y tablas de frecuencia',
  'Estadística: medidas estadísticas I',
  'Estadística: medidas estadísticas II',
  'Taller de estadística'
];

const temasCurso2 = [
  'Derivadas: noción de límite, razón de cambio promedio e instantáneo, regla de derivación y regla de la cadena',
  'Recta tangente, normal y derivación implícita',
  'Razón de cambio',
  'Derivada de una función y sus aplicaciones en la razón de cambio',
  'Linealización, diferenciales y propagación de errores',
  'Criterio de la primera y segunda derivada',
  'Optimización',
  'Taller de problemas: Diferenciales, máximos y mínimos, optimización y concavidad',
  'Integral indefinida',
  'Integral definida y cálculo de áreas',
  'Volumen de un sólido de revolución y longitud de arco de una curva',
  'Área de la superficie de un sólido de revolución y taller',
  'Probabilidad clásica e introducción a la probabilidad condicional',
  'Probabilidad total, teorema de Bayes y variable aleatoria discreta',
  'Variable aleatoria continua y distribución binomial',
  'Distribución normal y repaso de probabilidades'
];

const carrerasLista = [
  'Administración y Emprendimiento de Negocios Digitales',
  'Marketing Digital Analítico',
  'Diseño Industrial',
  'Tecnología de la Producción',
  'Producción y Gestión Industrial',
  'Logística Digital Integrada',
  'Topografía y Geomática',
  'Procesos Químicos y Metalúrgicos',
  'Operaciones Mineras',
  'Operación de Plantas de Procesamiento de Minerales',
  'Gestión de Seguridad y Salud en el Trabajo',
  'Mantenimiento de Equipo Pesado',
  'Mecatrónica y Gestión Automotriz',
  'Gestión y Mantenimiento de Maquinaria Pesada',
  'Aviónica y Mecánica Aeronáutica',
  'Mantenimiento y Gestión de Plantas Industriales',
  'Tecnología Mecánica Eléctrica',
  'Ciberseguridad y Auditoría Informática',
  'Diseño y Desarrollo de Software',
  'Diseño y Desarrollo de Simuladores y Videojuegos',
  'Administración de Redes y Comunicaciones',
  'Big Data y Ciencia de Datos',
  'Modelado y Animación Digital'
];

// Generador de guía de 5 pasos (JSON)
const generarPasosGuia = (pasosPersonalizados = []) => {
  const pasosGenerales = [
    { paso: 1, titulo: 'Simplificación y Distribución', texto: 'Si la ecuación contiene paréntesis o fracciones, distribuye y simplifica.' },
    { paso: 2, titulo: 'Combinar Términos', texto: 'Combina términos semejantes en cada lado.' },
    { paso: 3, titulo: 'Transposición', texto: 'Traslada términos con variable a un lado y constantes al otro.' },
    { paso: 4, titulo: 'Reducir', texto: 'Reduce a la forma más simple.' },
    { paso: 5, titulo: 'Despejar', texto: 'Despeja la variable dividiendo por el coeficiente.' }
  ];
  return JSON.stringify(pasosGenerales.map((p, i) => ({ ...p, texto: pasosPersonalizados[i]?.texto || p.texto })));
};

// Contenido específico para Semana 1 (Ecuaciones lineales)
const generarContenidoEcuacionesLineales = () => {
  const historia = {
    titulo_pregunta: '¿Sabías que la necesidad de repartir grano y medir tierras inspiró las ecuaciones lineales?',
    historia_introduccion: 'En Egipto y Babilonia se usaban problemas de reparto que originaron métodos para obtener incógnitas.',
    historia_nudo: 'Se resolvían mediante procedimientos algorítmicos sin notación simbólica.',
    historia_desenlace: 'Con Descartes la notación simbólica unió álgebra y geometría, facilitando el modelado actual.'
  };

  const ejercicios = [
    {
      enunciado_pregunta: 'Un técnico cobra 30 soles por visita y 12 soles por hora. Si el total fue 96, ¿cuántas horas trabajó? (solo el número)',
      respuesta_correcta_abierta: '5.5',
      pasos_guia: generarPasosGuia([
        { texto: 'Plantea: 30 + 12x = 96' },
        { texto: 'Resta 30: 12x = 66' },
        { texto: 'Divide por 12: x = 66/12' },
        { texto: 'Reduce la fracción' },
        { texto: 'Resultado: 5.5' }
      ])
    },
    {
      enunciado_pregunta: 'Si F = 1.8C + 32 y F=68, ¿cuál es C? (solo el número)',
      respuesta_correcta_abierta: '20',
      pasos_guia: generarPasosGuia([
        { texto: 'Sustituye: 68 = 1.8C + 32' },
        { texto: 'Resta 32: 36 = 1.8C' },
        { texto: 'Divide entre 1.8' },
        { texto: 'Resultado: 20' },
        { texto: 'Comprueba sustituyendo' }
      ])
    },
    {
      enunciado_pregunta: 'En un cuadrilátero dos ángulos miden 80° y 100°. Los otros dos son x. ¿x? (solo el número)',
      respuesta_correcta_abierta: '90',
      pasos_guia: generarPasosGuia([
        { texto: 'Suma: 80+100 = 180' },
        { texto: 'Plantea: 180 + 2x = 360' },
        { texto: 'Resta 180: 2x = 180' },
        { texto: 'Divide por 2' },
        { texto: 'x = 90' }
      ])
    },
    {
      enunciado_pregunta: 'Un vehículo recorre 240 km en 3 h. ¿Cuántos km en 5 h? (solo el número)',
      respuesta_correcta_abierta: '400',
      pasos_guia: generarPasosGuia([
        { texto: 'V = 240/3 = 80 km/h' },
        { texto: 'Multiplica por 5: 80*5' },
        { texto: 'Resultado: 400' },
        { texto: 'Verifica la unidad' },
        { texto: 'Conclusión: 400 km' }
      ])
    },
    {
      enunciado_pregunta: 'La edad de Juan es 3x y la de su hijo x. La diferencia es 30. ¿Edad del hijo? (solo el número)',
      respuesta_correcta_abierta: '15',
      pasos_guia: generarPasosGuia([
        { texto: 'Plantea: 3x - x = 30' },
        { texto: 'Combina: 2x = 30' },
        { texto: 'Divide entre 2' },
        { texto: 'x = 15' },
        { texto: 'Comprueba sumando' }
      ])
    }
  ];

  const quizPreguntas = ejercicios.map(ej => ({
    enunciado_pregunta: ej.enunciado_pregunta,
    tipo_pregunta: preguntas_tipo_pregunta.respuesta_abierta,
    puntos_otorgados: 10,
    respuesta_correcta_abierta: ej.respuesta_correcta_abierta,
    pista: ej.pista,
    pasos_guia: ej.pasos_guia
  }));

  return { historia, quizPreguntas };
};

// Generador genérico para otros temas (5 preguntas por tema)
const generarContenidoGenerico = (nombreTema, offset = 0) => {
  const historia = {
    titulo_pregunta: `¿Sabías que "${nombreTema}" tiene aplicaciones en ingeniería?`,
    historia_introduccion: `Breve introducción a ${nombreTema}.`,
    historia_nudo: `Cómo se aborda ${nombreTema} en problemas reales.`,
    historia_desenlace: `Aplicación práctica y conclusión sobre ${nombreTema}.`
  };

  const preguntas = Array.from({ length: 5 }).map((_, i) => ({
    enunciado_pregunta: `Calcule (solo el número) — pregunta ${i + 1} sobre ${nombreTema}.`,
    tipo_pregunta: preguntas_tipo_pregunta.respuesta_abierta,
    puntos_otorgados: 10,
    respuesta_correcta_abierta: String(200 + offset + i), // valor de ejemplo
    pasos_guia: generarPasosGuia([
      { texto: `Identifique la fórmula para ${nombreTema}.` },
      { texto: 'Sustituya los valores.' },
      { texto: 'Simplifique términos.' },
      { texto: 'Despeje la incógnita.' },
      { texto: 'Redondee si es necesario.' }
    ])
  }));

  return { historia, quizPreguntas: preguntas };
};

async function main() {
  console.log('🌱 Iniciando seed completo...');

  // Roles
  const rolAdmin = await prisma.roles.upsert({ where: { nombre_rol: 'Administrador' }, update: {}, create: { nombre_rol: 'Administrador' } });
  const rolEstudiante = await prisma.roles.upsert({ where: { nombre_rol: 'Estudiante' }, update: {}, create: { nombre_rol: 'Estudiante' } });

  // Institución (CORREGIDO: prisma.institucion en lugar de prisma.instituciones)
  const tecsup = await prisma.institucion.upsert({
    // El campo unique en model institucion es 'nombre'
    where: { nombre: 'Tecsup' }, 
    update: {},
    create: { nombre: 'Tecsup', dominio_correo: 'tecsup.edu.pe' }
  });

  // Carreras (lista completa)
  const carrerasCreadas = [];
  for (const nombre of carrerasLista) {
    // La clave única es 'nombre' en el modelo carrera.
    // La relación única 'institucion_id_nombre_carrera' que usabas no existe,
    // usamos solo 'nombre' que ya es @unique en tu esquema.
    const c = await prisma.carrera.upsert({
      where: { nombre: nombre },
      update: {},
      create: { institucion_id: tecsup.id, nombre: nombre }
    });
    carrerasCreadas.push(c);
  }
  console.log(`✅ ${carrerasCreadas.length} carreras creadas/verificadas.`);

  // 1️⃣ Crear ciclos globales
  const ciclosBase = [
    { nombre: 'Primer ciclo', numero: 1 },
    { nombre: 'Segundo ciclo', numero: 2 }
  ];

  for (const ciclo of ciclosBase) {
    await prisma.ciclo.upsert({
      where: { nombre: ciclo.nombre },
      update: {},
      create: ciclo
    });
  }

  // 2️⃣ Crear carreras y vincular con los ciclos globales
  const ciclos = await prisma.ciclo.findMany();

  // CORREGIDO: Itera sobre 'carrerasCreadas' y no sobre 'carrerasData' (variable no definida)
  for (const carreraCreada of carrerasCreadas) {
    
    // No es necesario upsert la carrera otra vez, solo las vinculaciones
    // const carreraCreada = await prisma.carrera.upsert({ ... }); 

    for (const ciclo of ciclos) {
      await prisma.carrera_ciclo.upsert({
        where: {
          carrera_id_ciclo_id: {
            carrera_id: carreraCreada.id,
            ciclo_id: ciclo.id
          }
        },
        update: {},
        create: {
          carrera_id: carreraCreada.id,
          ciclo_id: ciclo.id
        }
      });
    }
  }

  // Periodos académicos 2025-1 y 2025-2
  const periodo1 = await prisma.periodos_academicos.upsert({
    where: { nombre_periodo: '2025-1' },
    update: {},
    create: { nombre_periodo: '2025-1', fecha_inicio: new Date('2025-03-01'), fecha_fin: new Date('2025-07-15'), institucion_id: tecsup.id }
  });
  const periodo2 = await prisma.periodos_academicos.upsert({
    where: { nombre_periodo: '2025-2' },
    update: {},
    create: { nombre_periodo: '2025-2', fecha_inicio: new Date('2025-08-01'), fecha_fin: new Date('2025-12-15'), institucion_id: tecsup.id }
  });

  // --- PERSONAJES ---
  // IGNIX (HIPOPOTAMO)
  const personajeIgnix = await prisma.personajes.upsert({
    // CORRECCIÓN: Usamos asset_key porque es único y nombre ya no lo es.
    where: { asset_key: 'HIPOPOTAMO' },
    update: {
      asset_key: 'HIPOPOTAMO',
      url_imagen_base: `${BASE_URL}/hipopotamo.png`,
      mensaje_corta: 'La lógica fluye mejor cuando respiras hondo... como yo en la corriente.',
      mensaje_larga: 'No corre, ni se apura. Prefiere pensar despacio, como flotando en ideas. Cuando todo parece difícil, él sonríe y dice: "Respira... cada número tiene su ritmo". Su calma ayuda a resolver incluso los ejercicios más rebeldes.',
    },
    create: {
      nombre: 'IGNIX',
      asset_key: 'HIPOPOTAMO',
      url_imagen_base: `${BASE_URL}/hipopotamo.png`,
      mensaje_corta: 'La lógica fluye mejor cuando respiras hondo... como yo en la corriente.',
      mensaje_larga: 'No corre, ni se apura. Prefiere pensar despacio, como flotando en ideas. Cuando todo parece difícil, él sonríe y dice: "Respira... cada número tiene su ritmo". Su calma ayuda a resolver incluso los ejercicios más rebeldes.',
    }
  });

  // BRIZALI (LEON)
  const personajeBrizali = await prisma.personajes.upsert({
    // CORRECCIÓN: Usamos asset_key
    where: { asset_key: 'LEON' },
    update: {
      asset_key: 'LEON',
      url_imagen_base: `${BASE_URL}/leon.png`,
      mensaje_corta: 'Cada problema que resuelves es un rugido más fuerte en tu sistema de logros',
      mensaje_larga: 'Siempre creyó que cada problema matemático era una aventura. Cuando un estudiante dudaba, él rugía suave: ‘¡Tú puedes!’ Con su melena brillante y corazón fuerte, enseña que el coraje es la clave para avanzar.',
    },
    create: {
      nombre: 'BRIZALI',
      asset_key: 'LEON',
      url_imagen_base: `${BASE_URL}/leon.png`,
      mensaje_corta: 'Cada problema que resuelves es un rugido más fuerte en tu sistema de logros',
      mensaje_larga: 'Siempre creyó que cada problema matemático era una aventura. Cuando un estudiante dudaba, él rugía suave: ‘¡Tú puedes!’ Con su melena brillante y corazón fuerte, enseña que el coraje es la clave para avanzar.',
    }
  });

  // DROP (CONEJO)
  const personajeDrop = await prisma.personajes.upsert({
    // CORRECCIÓN: Usamos asset_key
    where: { asset_key: 'CONEJO' },
    update: {
      asset_key: 'CONEJO',
      url_imagen_base: `${BASE_URL}/conejo.png`,
      mensaje_corta: 'Los errores solo hacen que brinques más alto en tu camino al éxito',
      mensaje_larga: 'Brinca de sumas a ecuaciones como si fueran charcos. Aunque a veces se equivoca, nunca se rinde. Él cree que los errores son saltos que te llevan más alto. Su energía contagiosa motiva a aprender más!',
    },
    create: {
      nombre: 'DROP',
      asset_key: 'CONEJO',
      url_imagen_base: `${BASE_URL}/conejo.png`,
      mensaje_corta: 'Los errores solo hacen que brinques más alto en tu camino al éxito',
      mensaje_larga: 'Brinca de sumas a ecuaciones como si fueran charcos. Aunque a veces se equivoca, nunca se rinde. Él cree que los errores son saltos que te llevan más alto. Su energía contagiosa motiva a aprender más!',
    }
  });

  console.log('✅ Personajes (IGNIX, BRIZALI, DROP) creados con URLs y mensajes.');

  // --- TIPOS DE ITEM & ITEMS ---
  const tipoRopa = await prisma.tipos_item.upsert({
    where: { nombre_tipo: 'Ropa (Polos)' },
    update: {},
    create: { nombre_tipo: 'Ropa (Polos)' }
  });

  const polosData = [
    { nombre: 'Polo N° 1 (Rojo)', costo: 100, index: 1 },
    { nombre: 'Polo N° 2 (Azul)', costo: 200, index: 2 },
    { nombre: 'Polo N° 3 (Verde)', costo: 300, index: 3 },
    { nombre: 'Polo N° 4 (Rosa)', costo: 400, index: 4 },
    { nombre: 'Polo N° 5 (Gris)', costo: 500, index: 5 },
    { nombre: 'Polo N° 6 (Blanco)', costo: 600, index: 6 },
  ];

  // Crear items de polos
  const polosCreados = [];
  for (const poloInfo of polosData) {
    const i = poloInfo.index;
    
    const polo = await prisma.items.upsert({
      where: { nombre_item: poloInfo.nombre },
      update: {},
      create: {
        nombre_item: poloInfo.nombre,
        tipo_item_id: tipoRopa.id,
        costo_gemas: poloInfo.costo,
        asset_index: i,
        url_icono_tienda: `${BASE_URL}/polo_${i}.png`, 
        
        // JSON de URLs equipadas, mapeado por asset_key del personaje
        url_imagenes_equipado: {
          "LEON": `${BASE_URL}/leon_polo_${i}.png`,      // Para BRIZALI
          "HIPOPOTAMO": `${BASE_URL}/hipopotamo_polo_${i}.png`, // Para IGNIX
          "CONEJO": `${BASE_URL}/conejo_polo_${i}.png`   // Para DROP
        }
      },
    });
    polosCreados.push(polo);
  }
  console.log('✅ Items (polos) creados con URLs dinámicas.');

  // Mensajes motivacionales
  const mensajes = [
    { tipo: 'acierto', texto_mensaje: '¡Excelente! Sigue así y dominarás el universo de los números.' },
    { tipo: 'fallo', texto_mensaje: '¡No te rindas! El error es el primer paso para aprender.' }
  ];
  for (const m of mensajes) {
    await prisma.mensajes_motivacionales.upsert({
      where: { texto_mensaje: m.texto_mensaje },
      update: {},
      create: m
    });
  }
  console.log('✅ Mensajes motivacionales creados.');

  // Usuarios de prueba: Leo (primer ciclo de Diseño y Desarrollo de Software), Angela (segundo ciclo)
  // localizar carrera 'Diseño y Desarrollo de Software'
  const carreraSoftware = await prisma.carrera.findFirst({ where: { nombre: 'Diseño y Desarrollo de Software', institucion_id: tecsup.id } });
  if (!carreraSoftware) {
    throw new Error('No existe la carrera "Diseño y Desarrollo de Software" en la DB.');
  }
  
  // localizar ciclos (CORREGIDO: Busca por nombre/número, no por relaciones inexistentes)
  const cicloPrimer = await prisma.ciclo.findFirst({ where: { nombre: 'Primer ciclo', numero: 1 } });
  const cicloSegundo = await prisma.ciclo.findFirst({ where: { nombre: 'Segundo ciclo', numero: 2 } });
    
  if (!cicloPrimer || !cicloSegundo) {
      throw new Error('No se encontraron los ciclos base (Primer ciclo/Segundo ciclo).');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // CORRECCIÓN: Usar los nuevos nombres de variables de personajes
  const leo = await prisma.usuarios.upsert({
    where: { correo_electronico: 'leo.caballero@tecsup.edu.pe' },
    update: {},
    create: {
      nombre: 'Leo',
      apellido: 'Caballero',
      correo_electronico: 'leo.caballero@tecsup.edu.pe',
      hash_contrasena: hashedPassword,
      rol_id: rolAdmin.id,
      institucion_id: tecsup.id,
      carrera_id: carreraSoftware.id,
      ciclo_actual_id: cicloPrimer.id,
      fecha_nacimiento: new Date('2004-03-27'),
      ano_ingreso: new Date().getFullYear() - 1,
      periodo_actual_id: periodo1.id,
      personaje_activo_id: personajeBrizali.id, // CORREGIDO: era personajeKhipu
      puntos_experiencia: 1500,
      gemas: 100
    }
  });

  const angela = await prisma.usuarios.upsert({
    where: { correo_electronico: 'angela.baltazar@tecsup.edu.pe' },
    update: {},
    create: {
      nombre: 'Angela',
      apellido: 'Baltazar',
      correo_electronico: 'angela.baltazar@tecsup.edu.pe',
      hash_contrasena: hashedPassword,
      rol_id: rolEstudiante.id,
      institucion_id: tecsup.id,
      carrera_id: carreraSoftware.id,
      ciclo_actual_id: cicloSegundo.id,
      fecha_nacimiento: new Date('2005-06-05'),
      ano_ingreso: new Date().getFullYear() - 2,
      periodo_actual_id: periodo1.id,
      personaje_activo_id: personajeIgnix.id, // CORREGIDO: era personajeInti
      puntos_experiencia: 800,
      gemas: 50
    }
  });
  console.log('✅ Usuarios de prueba creados (Leo, Angela).');

  // Cursos (2) - asignar al ciclo del "carreraSoftware" correspondiente
  // Crear curso 1 -> Cálculo y Estadística (Primer Ciclo)
  const cursoCalculo = await prisma.cursos.upsert({
    // El campo unique es ciclo_id_nombre_curso_uq
    where: { ciclo_id_nombre_curso: { ciclo_id: cicloPrimer.id, nombre_curso: 'Cálculo y Estadística' } }, 
    update: {},
    create: {
      ciclo_id: cicloPrimer.id,
      nombre_curso: 'Cálculo y Estadística',
      descripcion: 'Curso de primer ciclo: álgebra, funciones, estadística básica.'
    }
  });

  // Crear curso 2 -> Aplicaciones de Cálculo y Estadística (Segundo Ciclo)
  const cursoAplic = await prisma.cursos.upsert({
    where: { ciclo_id_nombre_curso: { ciclo_id: cicloSegundo.id, nombre_curso: 'Aplicaciones de Cálculo y Estadística' } },
    update: {},
    create: {
      ciclo_id: cicloSegundo.id,
      nombre_curso: 'Aplicaciones de Cálculo y Estadística',
      descripcion: 'Curso de segundo ciclo: derivadas, integrales y probabilidad aplicada.'
    }
  });
  console.log('✅ Cursos creados (Cálculo y Estadística, Aplicaciones).');

  // Generar Temas/Lecciones/Preguntas para cada curso
  // Curso 1 (temasCurso1) - 16 semanas
  for (const [i, temaNombre] of temasCurso1.entries()) {
    const orden = i + 1;
    // contenido
    let contenido;
    if (orden === 1) {
      contenido = generarContenidoEcuacionesLineales();
    } else {
      contenido = generarContenidoGenerico(temaNombre, i);
    }

    // crear tema
    const temaCreado = await prisma.temas.upsert({
      // El campo unique es idx_orden_tema_curso_unico
      where: { curso_id_orden: { curso_id: cursoCalculo.id, orden } }, 
      update: {},
      create: {
        curso_id: cursoCalculo.id,
        nombre_tema: temaNombre,
        orden,
        titulo_pregunta: contenido.historia.titulo_pregunta,
        historia_introduccion: contenido.historia.historia_introduccion,
        historia_nudo: contenido.historia.historia_nudo,
        historia_desenlace: contenido.historia.historia_desenlace,
        url_imagen_inicio: `/historias/curso1/tema${orden}_intro.png`,
        url_imagen_nudo: `/historias/curso1/tema${orden}_nudo.png`,
        url_imagen_desenlace: `/historias/curso1/tema${orden}_desenlace.png`
      }
    });

    // crear leccion (orden 1) con 5 preguntas abiertas
    const preguntasCreate = contenido.quizPreguntas.map(q => ({
      enunciado_pregunta: q.enunciado_pregunta,
      tipo_pregunta: q.tipo_pregunta,
      puntos_otorgados: q.puntos_otorgados || 10,
      respuesta_correcta_abierta: q.respuesta_correcta_abierta,
      pasos_guia: q.pasos_guia
    }));

    await prisma.lecciones.upsert({
      // El campo unique es tema_id_orden_uq
      where: { tema_id_orden: { tema_id: temaCreado.id, orden: 1 } }, 
      update: {},
      create: {
        tema_id: temaCreado.id,
        titulo_leccion: `Quiz Semanal: ${temaNombre}`,
        contenido_teorico: `Evaluación de la unidad ${orden}: ${temaNombre}.`,
        orden: 1,
        tiempo_limite_segundos: 1200,
        preguntas: { create: preguntasCreate }
      }
    });

    console.log(`→ Tema creado: [C1-S${orden}] ${temaNombre}`);
  }

  // Curso 2 (temasCurso2) - 16 semanas
  for (const [i, temaNombre] of temasCurso2.entries()) {
    const orden = i + 1;
    const contenido = generarContenidoGenerico(temaNombre, 100 + i); // offset para respuestas de ejemplo

    const temaCreado = await prisma.temas.upsert({
      where: { curso_id_orden: { curso_id: cursoAplic.id, orden } },
      update: {},
      create: {
        curso_id: cursoAplic.id,
        nombre_tema: temaNombre,
        orden,
        titulo_pregunta: contenido.historia.titulo_pregunta,
        historia_introduccion: contenido.historia.historia_introduccion,
        historia_nudo: contenido.historia.historia_nudo,
        historia_desenlace: contenido.historia.historia_desenlace,
        url_imagen_inicio: `/historias/curso2/tema${orden}_intro.png`,
        url_imagen_nudo: `/historias/curso2/tema${orden}_nudo.png`,
        url_imagen_desenlace: `/historias/curso2/tema${orden}_desenlace.png`
      }
    });

    const preguntasCreate = contenido.quizPreguntas.map(q => ({
      enunciado_pregunta: q.enunciado_pregunta,
      tipo_pregunta: q.tipo_pregunta,
      puntos_otorgados: q.puntos_otorgados || 10,
      respuesta_correcta_abierta: q.respuesta_correcta_abierta,
      pista: q.pista,
      pasos_guia: q.pasos_guia
    }));

    await prisma.lecciones.upsert({
      where: { tema_id_orden: { tema_id: temaCreado.id, orden: 1 } },
      update: {},
      create: {
        tema_id: temaCreado.id,
        titulo_leccion: `Quiz Semanal: ${temaNombre}`,
        contenido_teorico: `Evaluación de la unidad ${orden}: ${temaNombre}.`,
        orden: 1,
        tiempo_limite_segundos: 1200,
        preguntas: { create: preguntasCreate }
      }
    });

    console.log(`→ Tema creado: [C2-S${orden}] ${temaNombre}`);
  }

  // Obtener polos específicos para el inventario
  const poloRojo = polosCreados.find(polo => polo.nombre_item === 'Polo N° 1 (Rojo)');
  const poloAzul = polosCreados.find(polo => polo.nombre_item === 'Polo N° 2 (Azul)');

  if (!poloRojo || !poloAzul) {
    throw new Error('No se encontraron los polos rojo y azul en la base de datos');
  }

  // Inventario de ejemplo: asignar Polo Rojo a Leo y Polo Azul a Angela
  await prisma.inventario_usuario.upsert({
    where: { usuario_id_item_id: { usuario_id: leo.id, item_id: poloRojo.id } },
    update: {},
    create: { usuario_id: leo.id, item_id: poloRojo.id, cantidad: 1 }
  });

  await prisma.inventario_usuario.upsert({
    where: { usuario_id_item_id: { usuario_id: angela.id, item_id: poloAzul.id } },
    update: {},
    create: { usuario_id: angela.id, item_id: poloAzul.id, cantidad: 1 }
  });

  // Equipo (equipar el polo)
  await prisma.equipo_usuario.upsert({
    where: { usuario_id_tipo_item_id: { usuario_id: leo.id, tipo_item_id: tipoRopa.id } },
    update: { item_id: poloRojo.id },
    create: { usuario_id: leo.id, tipo_item_id: tipoRopa.id, item_id: poloRojo.id }
  });

  await prisma.equipo_usuario.upsert({
    where: { usuario_id_tipo_item_id: { usuario_id: angela.id, tipo_item_id: tipoRopa.id } },
    update: { item_id: poloAzul.id },
    create: { usuario_id: angela.id, tipo_item_id: tipoRopa.id, item_id: poloAzul.id }
  });

  console.log('✅ Inventario y equipamiento asignado a usuarios de prueba.');

  console.log('🎉 SEMBRADO COMPLETO: Cursos, temas, lecciones, preguntas y datos de ejemplo creados.');

  // desconectar
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error en seed:', e);
  prisma.$disconnect();
  process.exit(1);
});
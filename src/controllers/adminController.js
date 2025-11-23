// src/controllers/adminController.js
const prisma = require('../prismaClient');

// ============================================================
// GET /api/admin/usuarios
// ============================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo_electronico: true,
        puntos_experiencia: true,
        gemas: true,
        // ✅ CORRECCIÓN: La relación se llama 'rol' (singular)
        rol: {
          select: {
            nombre_rol: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const safeUsers = users.map(user => ({
      id: user.id.toString(), // Convertimos BigInt a string
      nombre: user.nombre,
      apellido: user.apellido,
      correo_electronico: user.correo_electronico,
      puntos_experiencia: user.puntos_experiencia,
      gemas: user.gemas,
      // ✅ CORRECCIÓN: Accedemos a 'rol' (singular)
      rol: user.rol ? user.rol.nombre_rol : null 
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error('❌ Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
};

// ============================================================
// GET /api/admin/usuarios/:id
// ============================================================
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.usuarios.findUnique({
      // ✅ CORRECCIÓN: Convertimos el ID del parámetro a BigInt
      where: { id: BigInt(id) }, 
      include: {
        // ✅ CORRECCIÓN: Nombres de relaciones y campos
        rol: {
          select: { nombre_rol: true },
        },
        personaje_activo: { // (Tu schema usa 'personaje_activo')
          select: { 
            nombre: true,
            asset_key: true // (Usamos 'asset_key' que es más útil)
          }, 
        },
        progreso_lecciones_usuario: { // (Este es el nombre de tu tabla de resumen)
          include: {
            lecciones: {
              select: { titulo_leccion: true },
            },
          },
          orderBy: {
            id: 'desc', // (Tu schema no tiene 'updatedAt', usamos 'id')
          },
        },
        institucion: { // (Singular)
          select: { nombre: true } // (El campo se llama 'nombre')
        },
        carrera: { // (Singular)
          select: { nombre: true } // (El campo se llama 'nombre')
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    
    // --- Formateamos la respuesta ---
    const userProfile = {
      id: user.id.toString(), // Convertimos el ID principal a string
      nombre: user.nombre,
      apellido: user.apellido,
      correo_electronico: user.correo_electronico,
      fecha_nacimiento: user.fecha_nacimiento,
      ano_ingreso: user.ano_ingreso,
      puntos_experiencia: user.puntos_experiencia,
      gemas: user.gemas,
      // ✅ CORRECCIÓN: Nombres de relaciones y campos
      rol: user.rol ? user.rol.nombre_rol : null,
      institucion: user.institucion ? user.institucion.nombre : null,
      carrera: user.carrera ? user.carrera.nombre : null,
      personaje_activo: user.personaje_activo ? user.personaje_activo : null,
      
      // Historial de progreso (leído desde la tabla de resumen)
      historial_progreso: user.progreso_lecciones_usuario.map(p => ({
        leccion: p.lecciones.titulo_leccion,
        estado: p.estado,
        // ✅ CORRECCIÓN: El campo se llama 'puntaje_total'
        puntaje_total: p.puntaje_total, 
        intentos: p.intentos,
        // (Tu schema no tiene 'updatedAt' en esta tabla)
      })),
    };
    // --- Fin del formateo ---

    res.json(userProfile); // Enviamos el objeto limpio y seguro

  } catch (error) {
    console.error('❌ Error al obtener el detalle del usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener el detalle del usuario.' });
  }
};
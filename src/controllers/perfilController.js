// src/controllers/perfilController.js
const prisma = require('../prismaClient');

// ============================================================
// GET /api/perfil/me
// ============================================================
exports.obtenerMiPerfil = async (req, res) => {
    const usuarioId = BigInt(req.usuario.id); 

    try {
        const perfil = await prisma.usuarios.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                correo_electronico: true,
                
                // --- RELACIONES NUEVAS/EXISTENTES ---
                institucion: { select: { nombre: true } }, 
                carrera: { select: { nombre: true } },
                rol: { select: { nombre_rol: true } },
                
                // 🚨 PASO CLAVE 1: Incluir la relación 'ciclo_actual'
                ciclo_actual: { select: { nombre: true } }, 
                
                // --- PUNTOS Y GEMAS ---
                gemas: true,
                puntos_experiencia: true,
                
                nombre_personaje_usuario: true,
                personaje_activo: { select: { nombre: true } },
            },
        });

        if (!perfil) {
            return res.status(404).json({ error: 'Perfil no encontrado.' });
        }

        // --- Formateamos la respuesta ---
        const respuesta = {
            id: perfil.id.toString(), // Convertimos BigInt a String
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            correo_electronico: perfil.correo_electronico,
            rol: perfil.rol ? perfil.rol.nombre_rol : null,
            institucion: perfil.institucion ? perfil.institucion.nombre : null,
            carrera: perfil.carrera ? perfil.carrera.nombre : null,
            
            // 🚨 PASO CLAVE 2: Incluir el nombre del ciclo en la respuesta
            ciclo: perfil.ciclo_actual ? perfil.ciclo_actual.nombre : 'No especificado', 
            
            gemas: perfil.gemas,
            puntos_experiencia: perfil.puntos_experiencia,
            personaje_activo: {
                nombre: perfil.personaje_activo ? perfil.personaje_activo.nombre : "Sin personaje",
            }
        };

        res.json(respuesta);

    } catch (error) {
        console.error('❌ Error al obtener el perfil:', error.message);
        res.status(500).json({ error: 'Error al obtener el perfil del usuario.' });
    }
};
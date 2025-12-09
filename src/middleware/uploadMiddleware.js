// src/middleware/uploadMiddleware.js (CÓDIGO NUEVO COMPLETO y DINÁMICO)
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

// 1. CONFIGURACIÓN DE CLOUDINARY (Usa las variables que pusiste en Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// FUNCIÓN DE LÓGICA DINÁMICA
const getFolderAndPrefix = (req) => {
    // La URL original es, por ejemplo, /api/temas o /api/personajes
    const url = req.originalUrl || '';

    let folder = 'llama_matematica/otros'; // Carpeta por defecto
    let prefix = 'otros';

    if (url.includes('/temas')) {
        folder = 'llama_matematica/temas';
        prefix = 'tema';
    } else if (url.includes('/personajes')) {
        folder = 'llama_matematica/personajes';
        prefix = 'personaje';
    } else if (url.includes('/tienda')) {
        // Asumiendo que la tienda también tiene una ruta
        folder = 'llama_matematica/tienda';
        prefix = 'item';
    }
    
    return { folder, prefix };
};


// 2. CONFIGURACIÓN DE ALMACENAMIENTO (Ahora usa la lógica dinámica)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const { folder, prefix } = getFolderAndPrefix(req);
    
    return {
        folder: folder,
        format: 'webp', // Optimizaciones
        // Nombre de archivo más limpio y usando el prefijo correcto
        public_id: `${prefix}_${Date.now()}_${file.fieldname}` 
    };
  }
});

// 3. Filtro de archivos (igual)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen válida'), false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

module.exports = upload;
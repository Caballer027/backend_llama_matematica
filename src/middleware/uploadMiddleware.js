// src/middleware/uploadMiddleware.js (CÓDIGO NUEVO COMPLETO)
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

// 1. CONFIGURACIÓN DE CLOUDINARY (Usa las variables que pusiste en Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. CONFIGURACIÓN DE ALMACENAMIENTO (Ahora usa Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // La imagen se guardará en la carpeta 'llama_matematica/temas' dentro de Cloudinary
    const folderName = 'llama_matematica/temas';
    
    return {
        folder: folderName,
        format: 'webp', // Optimización automática
        public_id: `${folderName}_${Date.now()}_${file.fieldname}` 
    };
  }
});

// 3. Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Se usa MulterError para el manejo de errores
    cb(new Error('No es una imagen válida'), false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

module.exports = upload;
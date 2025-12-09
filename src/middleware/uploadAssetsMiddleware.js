// src/middleware/uploadAssetsMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const p = path.join(__dirname, '../../public/assets'); // <--- CAMBIO AQUÍ
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    cb(null, p);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

module.exports = multer({ storage });
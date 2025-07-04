const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
console.log('API Key:', process.env.GOOGLE_MAPS_API_KEY);

const app = express();

// Middleware global — debe ir primero para habilitar CORS y parsear JSON
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Inicializar Firebase Admin usando .env
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FB_BUCKET,
  });
}

const bucket = admin.storage().bucket();

const mapsRoutes = require('./maps');
const notiRoutes = require('./noti');
const userRoutes = require('./users');
const pdfRoutes = require('./pdf');
const imgpdfRoutes = require('./imagenpdf');

// 📦 Rutas

app.use('/api', mapsRoutes);
app.use('/api', notiRoutes);
app.use('/api', userRoutes);
app.use('/api', pdfRoutes);
app.use('/api', imgpdfRoutes);

// Configurar Multer (subida a carpeta temporal)
const upload = multer({ dest: 'uploads/' });

// Ruta para subir imagen
app.post('/upload', upload.single('foto'), async (req, res) => {
  const archivo = req.file;
  const mid = req.body.mid; // 👈 Agrega esto para recibir el ID de la mascota

  if (!archivo) {
    console.warn('⚠️ No se recibió archivo');
    return res.status(400).send('No se subió ningún archivo.');
  }

  if (!mid) {
    console.warn('⚠️ No se recibió el ID de la mascota (mid)');
    return res.status(400).send('Falta el ID de la mascota (mid).');
  }

  if (!archivo.mimetype.startsWith('image/')) {
    fs.unlinkSync(archivo.path);
    return res.status(400).send('Solo se permiten archivos de imagen.');
  }

  const destino = `mascotas/${Date.now()}_${archivo.originalname}`;

  try {
    // Subir al bucket
    await bucket.upload(archivo.path, {
      destination: destino,
      metadata: {
        contentType: archivo.mimetype,
      },
    });

    fs.unlinkSync(archivo.path); // Eliminar archivo local temporal

    // Obtener URL firmada
    const file = bucket.file(destino);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2030',
    });

    // ✅ Actualizar Firestore
    await admin.firestore().collection('mascotas').doc(mid).update({
      imagen: url,
      imagenPath: destino,
    });

    console.log('✅ Imagen subida y datos actualizados para mascota:', mid);
    res.status(200).json({ url, path: destino });

  } catch (error) {
    console.error('🔥 Error al subir archivo o actualizar Firestore:', error);
    res.status(500).send('Error al subir el archivo.');
  }
});

app.get('/', (req, res) => {
  res.send('Servidor PawCare backend activo 🚀');
});


app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// ▶️ Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:3000`);
});
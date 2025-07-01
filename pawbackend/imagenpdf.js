const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

router.get('/imagen-firebase', async (req, res) => {
  const pathInBucket = req.query.path;

  if (!pathInBucket) {
    return res.status(400).json({ error: 'Ruta del archivo faltante.' });
  }

  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(pathInBucket);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'Archivo no encontrado en el bucket.' });
    }

    const [buffer] = await file.download();
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    res.status(200).json({ base64: base64Image });
  } catch (error) {
    console.error('❌ Error al obtener imagen desde Firebase:', error);
    res.status(500).json({ error: 'No se pudo obtener la imagen.' });
  }
});

module.exports = router;

const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/imagen-firebase', async (req, res) => {
  const imageUrl = decodeURIComponent(req.query.url);

  if (!imageUrl) {
    return res.status(400).json({ error: 'URL de imagen faltante.' });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Error al obtener imagen: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    res.status(200).json({ base64: base64Image });
  } catch (error) {
    console.error('❌ Error al obtener imagen desde Firebase:', error);
    res.status(500).json({ error: 'No se pudo obtener la imagen.' });
  }
});

module.exports = router;

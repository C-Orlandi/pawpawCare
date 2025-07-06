//pdf
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/enviar-pdf', async (req, res) => {
  const { email, asunto, pdfBase64, nombreArchivo } = req.body;

  if (!email || !pdfBase64 || !nombreArchivo) {
    return res.status(400).send({ error: 'Faltan datos para enviar el correo.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pawcare.apppaw@gmail.com',
      pass: 'dkab ymkl wivh jmbz'
    }
  });

  const mailOptions = {
    from: 'PawCare <pawcare.apppaw@gmail.com>',
    to: email,
    subject: asunto,
    text: 'Adjunto encontrarás el historial en formato PDF.',
    attachments: [
      {
        filename: nombreArchivo,
        content: pdfBase64,
        encoding: 'base64'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`PDF enviado a ${email}`);
    res.status(200).send({ message: 'Email con PDF enviado correctamente.' });
  } catch (error) {
    console.error('Error enviando PDF:', error);
    res.status(500).send({ error: 'Error al enviar el PDF.' });
  }
});

module.exports = router;

const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

router.delete('/usuarios/:uid', async (req, res) => {
  const uid = req.params.uid;

  if (!uid) {
    console.warn('UID no proporcionado para eliminación');
    return res.status(400).send({ error: 'Se requiere el UID del usuario' });
  }

  try {
    console.log(`Eliminando usuario con UID: ${uid}`);
    await admin.auth().deleteUser(uid);
    console.log(`Usuario ${uid} eliminado correctamente`);
    res.status(200).send({ message: 'Usuario eliminado de Auth' });
  } catch (error) {
    console.error('Error eliminando usuario de Auth:', error);
    res.status(500).send({ error: 'No se pudo eliminar el usuario de Auth' });
  }
});

router.put('/usuarios', async (req, res) => {
  const { uid, email, password } = req.body;

  if (!uid || !email || !password) {
    console.warn('Faltan datos para actualizar usuario:', { uid, email });
    return res.status(400).send({ error: 'uid, email y password son requeridos' });
  }

  try {
    console.log(`Actualizando usuario UID: ${uid}`);
    await admin.auth().updateUser(uid, { email, password });
    console.log(`Usuario ${uid} actualizado correctamente`);
    res.status(200).send({ message: 'Usuario actualizado en Auth' });
  } catch (error) {
    console.error('Error actualizando usuario en Auth:', error);
    res.status(500).send({ error: 'No se pudo actualizar el usuario en Auth' });
  }
});

router.put('/usuarios/perfil', async (req, res) => {
  const { uid, email, password, nombre, contacto } = req.body;

  if (!uid) {
    return res.status(400).send({ error: 'Se requiere el UID' });
  }

  if (!email && (!password || password.trim() === '') && !nombre && !contacto) {
    return res.status(400).send({ error: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const updateAuthData = {};
    const updateUsuarios = {};
    const updateDuenos = {};

    if (email) {
      const userRecord = await admin.auth().getUser(uid);

      if (email !== userRecord.email) {
        try {
          const userWithEmail = await admin.auth().getUserByEmail(email);
          if (userWithEmail.uid !== uid) {
            return res.status(400).send({ error: 'El email ya está en uso por otro usuario.' });
          }
        } catch (err) {
        }
        updateAuthData.email = email;
        updateUsuarios.email = email;
        updateDuenos.email = email;
      }
    }

    if (password && password.trim() !== '') {
      updateAuthData.password = password;
    }

    if (nombre) {
      updateUsuarios.nombre = nombre;
      updateDuenos.nombre = nombre;
    }

    if (contacto) {
      updateUsuarios.contacto = contacto;
      updateDuenos.contacto = contacto;
    }

    if (Object.keys(updateAuthData).length > 0) {
      await admin.auth().updateUser(uid, updateAuthData);
    }

    const db = admin.firestore();

    if (Object.keys(updateUsuarios).length > 0) {
      const usuariosRef = db.collection('usuarios').doc(uid);
      await usuariosRef.update(updateUsuarios);
    }

    if (Object.keys(updateDuenos).length > 0) {
      const duenosRef = db.collection('duenos').doc(uid);
      await duenosRef.update(updateDuenos);
    }

    return res.status(200).send({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return res.status(500).send({ error: 'No se pudo actualizar el perfil' });
  }
});

module.exports = router;

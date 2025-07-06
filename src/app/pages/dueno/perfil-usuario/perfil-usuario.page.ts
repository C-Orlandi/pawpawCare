import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UsuariosService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss']
})
export class PerfilUsuarioPage implements OnInit {

  usuarioAuth?: firebase.User;
  usuarioData?: Usuario;

  nombre = '';
  email = '';
  contacto = '';

  toolbarColor: string = ''; 

  constructor(
    private afAuth: AngularFireAuth,
    private usuarioService: UsuariosService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private firestore: AngularFirestore,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.usuarioAuth = user;
      this.email = user.email ?? '';

      this.usuarioService.getUsuarioPorUid(user.uid).subscribe(data => {
        if (data) {
          this.usuarioData = data;
          this.nombre = data.nombre || '';
          this.contacto = data.contacto || '';
        }
      });
    });
  }

  async guardarCambios() {
    if (!this.usuarioAuth || !this.usuarioData) return;

    const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loading.present();

    try {
      await this.usuarioService.actualizarPerfil({
        uid: this.usuarioAuth.uid,
        email: this.email,
        nombre: this.nombre,
        contacto: this.contacto
      }).toPromise();
      //actualizar mascotas
      await this.actualizarDatosEnMascotas(this.usuarioAuth.uid, this.nombre, this.contacto);

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Perfil actualizado correctamente.',
        buttons: ['OK']
      });
      await alert.present();

      if (this.email !== this.usuarioAuth.email) {
        await this.afAuth.signOut();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el perfil: ' + error,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async actualizarDatosEnMascotas(uid: string, nuevoNombre: string, nuevoContacto: string) {
    const snapshot = await this.firestore.collection('mascotas', ref =>
      ref.where('usuarioUid', '==', uid)
    ).get().toPromise();

    console.log('🐾 Mascotas encontradas:', snapshot?.size);

    const batch = this.firestore.firestore.batch();

    snapshot?.forEach(doc => {
      console.log('🔁 Actualizando mascota:', doc.id);
      const mascotaRef = this.firestore.firestore.collection('mascotas').doc(doc.id);
      batch.update(mascotaRef, {
        'dueno.nombre': nuevoNombre,
        'dueno.contacto': nuevoContacto
      });
    });

    await batch.commit();
  }

  goBack() {
    this.navCtrl.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/compat/app';
import { TemaService } from 'src/app/services/tema.service';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.page.html',
  styleUrls: ['./configuraciones.page.scss'],
})
export class ConfiguracionesPage implements OnInit {

  usuarioAuth?: firebase.User;
  mostrarPassword = false;
  formPassword!: FormGroup;
  mostrarEliminar = false;
  toolbarColor: string = ''; 
  mostrarPersonalizacion = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private afs: AngularFirestore,
    private temaService: TemaService
  ) {}

  ngOnInit() {
  this.formPassword = this.fb.group({
    password: ['', [Validators.minLength(6)]],
    passwordConfirm: ['']
  }, {
    validators: this.passwordsIguales('password', 'passwordConfirm')
  });

  // Aplica directamente el color guardado
  const colorActual = this.temaService.getColorFromStorage();
  this.toolbarColor = colorActual;
  this.temaService.setColor(colorActual); // asegura que el body tenga la clase al iniciar

  // Subscripción reactiva (opcional si usas localStorage)
  this.temaService.colorToolbar$.subscribe(color => {
    this.toolbarColor = color;
  });

  this.afAuth.authState.subscribe(user => {
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioAuth = user;

    this.afs.collection('usuarios').doc(user.uid).get().subscribe(doc => {
      if (doc.exists) {
        const data = doc.data() as { toolbarColor?: string };
        if (data?.toolbarColor) {
          this.temaService.setColor(data.toolbarColor);
        }
      }
    });
  });
}

  passwordsIguales(pass1: string, pass2: string) {
    return (formGroup: FormGroup) => {
      const p1 = formGroup.get(pass1)?.value;
      const p2 = formGroup.get(pass2)?.value;
      return p1 === p2 ? null : { noIguales: true };
    };
  }

  toggleCambiarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async guardarCambios() {
    if (!this.usuarioAuth || !this.formPassword.valid) return;

    const nuevaPassword = this.formPassword.get('password')?.value;

    const loading = await this.loadingCtrl.create({ message: 'Actualizando contraseña...' });
    await loading.present();

    try {
      const user = await this.afAuth.currentUser;
      if (user && nuevaPassword) {
        await user.updatePassword(nuevaPassword);
      }

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Contraseña actualizada correctamente.',
        buttons: ['OK']
      });
      await alert.present();

      this.formPassword.reset();
      this.mostrarPassword = false;

    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cambiar la contraseña: ' + error,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  togglePersonalizacion() {
    this.mostrarPersonalizacion = !this.mostrarPersonalizacion;
  }

  toggleEliminarCuenta() {
    this.mostrarEliminar = !this.mostrarEliminar;
  }

  async eliminarCuenta() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            if (!this.usuarioAuth) return;

            const loading = await this.loadingCtrl.create({
              message: 'Eliminando cuenta...'
            });
            await loading.present();

            try {
              // Eliminar usuario en Firestore
              await import('firebase/compat/app').then(firebase => {
                firebase.default.firestore().collection('usuarios').doc(this.usuarioAuth!.uid).delete();
              });

              // Eliminar cuenta en Auth
              await this.usuarioAuth.delete();

              await loading.dismiss();
              await this.afAuth.signOut();
              this.router.navigate(['/login']);
            } catch (error) {
              await loading.dismiss();
              const errAlert = await this.alertCtrl.create({
                header: 'Error',
                message: 'No se pudo eliminar la cuenta: ' + error,
                buttons: ['OK']
              });
              await errAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  goBack() {
    this.navCtrl.back();
  }

  async cambiarColor(color: string) {
    this.toolbarColor = color;
    this.temaService.setColor(color);  // actualiza el color global

    if (this.usuarioAuth) {
      try {
        await this.afs.collection('usuarios').doc(this.usuarioAuth.uid).update({ toolbarColor: color });
      } catch (error) {
        console.error('Error guardando color toolbar:', error);
      } 
    }
  }
}

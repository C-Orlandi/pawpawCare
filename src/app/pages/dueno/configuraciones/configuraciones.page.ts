import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UsuariosService } from 'src/app/services/usuario.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.page.html',
  styleUrls: ['./configuraciones.page.scss'],
})
export class ConfiguracionesPage implements OnInit {

  usuarioAuth?: firebase.User;
  mostrarPassword = false;
  formPassword!: FormGroup;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.formPassword = this.fb.group({
      password: ['', [Validators.minLength(6)]],
      passwordConfirm: ['']
    }, {
      validators: this.passwordsIguales('password', 'passwordConfirm')
    });

    this.afAuth.authState.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.usuarioAuth = user;
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

  goBack() {
    this.navCtrl.back();
  }
}
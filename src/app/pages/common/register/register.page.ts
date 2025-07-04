import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AlertController, IonicModule, LoadingController, MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  verPassword: boolean = false;

  constructor(
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private menuController: MenuController,
    private firestore: AngularFirestore,
    private navCtrl: NavController
  ) {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      contacto: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.menuController.enable(false);
  }

  togglePassword() {
  this.verPassword = !this.verPassword;
}

  async registrarse() {
    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    const { nombre, contacto, email, pass } = this.registerForm.value;

    const loading = await this.loadingController.create({
      message: 'Registrando...',
    });
    await loading.present();

    try {
      const aux = await this.authService.register(email, pass);
      const user = aux.user;

      if (user) {
        // Guardar en 'usuarios'
        await this.firestore.collection('usuarios').doc(user.uid).set({
          uid: user.uid,
          nombre: nombre,
          contacto: contacto,
          email: email,
          tipo: 'dueno'
        });

        // Guardar en 'duenos'
        await this.firestore.collection('duenos').doc(user.uid).set({
          uid: user.uid,
          nombre: nombre,
          contacto: contacto,
          email: email,
          creadoEn: new Date()
        });

        await loading.dismiss();

        Swal.fire({
          icon: 'success',
          title: 'Registro Exitoso',
          text: 'Usuario registrado correctamente',
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => {
          (document.activeElement as HTMLElement)?.blur();
          this.router.navigate(['/login']);
        });
      }
    } catch (error: any) {
      console.error('🔥 Error al registrar en Firebase:', error);
      await loading.dismiss();
      this.mostrarMensajeDeError(error?.code);
    }
  }

  mostrarMensajeDeError(codigo: string) {
    let mensaje = 'Hubo un error al registrar el usuario.';
    switch (codigo) {
      case 'auth/email-already-in-use':
        mensaje = 'El correo ya está registrado.';
        break;
      case 'auth/invalid-email':
        mensaje = 'El correo no es válido.';
        break;
      case 'auth/weak-password':
        mensaje = 'La contraseña es muy débil.';
        break;
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonText: 'OK',
      heightAuto: false
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}
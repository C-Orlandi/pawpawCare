import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  emailValue?: string = '';
  passValue?: string = '';
  verPassword: boolean = false;
  
  constructor(
    private router: Router, 
    private loadingController: LoadingController,  
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private menuController: MenuController,
    private firestore: AngularFirestore
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required,Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.menuController.enable(false);
  }

  togglePassword() {
    this.verPassword = !this.verPassword;
  } 

  async login() {
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 2000
    });

    await loading.present();

    try {
      const email = this.loginForm.get('email')?.value;
      const pass = this.loginForm.get('pass')?.value;

      const aux = await this.authService.login(email, pass);

      if (aux.user) {
        const userSnap = await this.firestore.collection('usuarios').doc(aux.user.uid).get().toPromise();
        const usuarioData = userSnap?.data() as Usuario;

        if (usuarioData) {
          localStorage.setItem('usuarioLogin', JSON.stringify(usuarioData));
          console.log('Usuario logeado:', usuarioData);
        }

        await loading.dismiss();

        if (usuarioData?.tipo === 'admin') {
          this.router.navigate(['/adminhome']);
        } else if (usuarioData?.tipo === 'dueno') {
          this.router.navigate(['/userhome']);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Rol desconocido',
            text: 'Tu rol no tiene acceso definido.',
            confirmButtonText: 'OK',
            heightAuto: false
          });
        }
      }
    } catch (error) {
      await loading.dismiss();

      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al iniciar sesión.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      
      this.loginForm.reset();
    }
  }

  recovery() {
    this.router.navigate(['/resetpassword']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}
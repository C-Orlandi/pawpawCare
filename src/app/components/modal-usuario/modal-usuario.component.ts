  import { Component, Input, OnInit } from '@angular/core';
  import { ModalController, LoadingController } from '@ionic/angular';
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
  import { Usuario } from 'src/app/interfaces/usuario';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { AuthService } from 'src/app/services/auth.service';
  import { firstValueFrom } from 'rxjs';
  import Swal from 'sweetalert2';

  @Component({
    selector: 'app-modal-usuario',
    templateUrl: './modal-usuario.component.html'
  })
  export class ModalUsuarioComponent implements OnInit {

    @Input() usuario?: Usuario;

    usuarioForm!: FormGroup;

    constructor(
      private modalCtrl: ModalController,
      private fb: FormBuilder,
      private firestore: AngularFirestore,
      private authService: AuthService,
      private loadingCtrl: LoadingController
    ) {}

    ngOnInit() {
      this.usuarioForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
        email: [this.usuario?.email || '', [Validators.required, Validators.email]],
        pass: ['', [Validators.required, Validators.minLength(6)]],
        contacto: [this.usuario?.contacto || ''],
        tipo: [this.usuario?.tipo || 'dueno', Validators.required]
      });

      if (this.usuario) {
        this.usuarioForm.patchValue({
          nombre: this.usuario.nombre || '',
          email: this.usuario.email || '',
          contacto: this.usuario.contacto || '',
          tipo: this.usuario.tipo || 'dueno',
          pass: this.usuario.pass || '' 
        });
      }
    }

    async guardar() {
      if (this.usuarioForm.invalid) {
        Swal.fire({
          icon: 'warning',
          title: 'Formulario inválido',
          text: 'Por favor completa todos los campos obligatorios correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        return;
      }

      const loading = await this.loadingCtrl.create({
        message: this.usuario ? 'Actualizando usuario...' : 'Guardando usuario...',
        spinner: 'crescent',
        backdropDismiss: false
      });
      await loading.present();

      const formValue = this.usuarioForm.value;

      try {
        if (this.usuario) {
          const usuarioActualizado: Usuario = {
            uid: this.usuario.uid,
            ...formValue
          };

          await this.firestore.doc(`usuarios/${usuarioActualizado.uid}`).set(usuarioActualizado);
          await this.firestore.doc(`duenos/${usuarioActualizado.uid}`).set({
            uid: usuarioActualizado.uid,
            nombre: usuarioActualizado.nombre,
            email: usuarioActualizado.email,
            contacto: usuarioActualizado.contacto || '',
            creadoEn: new Date()
          });

          await firstValueFrom(this.authService.actualizarUsuarioEnAuth(
            usuarioActualizado.uid,
            usuarioActualizado.email,
            usuarioActualizado.pass
          ));

          await loading.dismiss();

          await Swal.fire({
            icon: 'success',
            title: 'Actualización exitosa',
            text: 'Usuario actualizado correctamente.',
            confirmButtonText: 'OK',
            heightAuto: false
          });

          this.modalCtrl.dismiss(true);

        } else {
          // Crear usuario en Auth y Firestore
          const aux = await this.authService.register(formValue.email, formValue.pass);

          const user = aux.user;
          if (!user) throw new Error('No se pudo crear el usuario en Auth');

          const nuevoUsuario: Usuario = {
            uid: user.uid,
            ...formValue
          };

          await this.firestore.doc(`usuarios/${user.uid}`).set(nuevoUsuario);
          await this.firestore.doc(`duenos/${user.uid}`).set({
            uid: user.uid,
            nombre: formValue.nombre,
            email: formValue.email,
            contacto: formValue.contacto || '',
            creadoEn: new Date()
          });

          await loading.dismiss();

          await Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Usuario creado correctamente.',
            confirmButtonText: 'OK',
            heightAuto: false
          });

          this.modalCtrl.dismiss(true);
        }
      } catch (error: any) {
        await loading.dismiss();

        console.error('Error al guardar usuario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.message || 'No se pudo guardar el usuario.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
      }
    }

    cerrar() {
      this.modalCtrl.dismiss(false);
    }

    generarPasswordAleatoria(longitud: number = 10) {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
      let password = '';
      for (let i = 0; i < longitud; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        password += caracteres.charAt(indice);
      }
      this.usuarioForm.patchValue({ pass: password });
    }
  }

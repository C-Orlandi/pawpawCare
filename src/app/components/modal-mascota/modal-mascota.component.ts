  import { Component, Input, OnInit } from '@angular/core';
  import { ModalController, LoadingController } from '@ionic/angular';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { Mascota } from 'src/app/interfaces/mascota';
  import { firstValueFrom, Observable } from 'rxjs';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import Swal from 'sweetalert2';

  @Component({
    selector: 'app-modal-mascota',
    templateUrl: './modal-mascota.component.html'
  })
  export class ModalMascotaComponent implements OnInit {
    @Input() mascota?: Mascota;
    usuarios$!: Observable<any[]>;
    mascotaForm!: FormGroup;

    constructor(
      private modalCtrl: ModalController,
      private fb: FormBuilder,
      private firestore: AngularFirestore,
      private loadingCtrl: LoadingController
    ) {}

    ngOnInit() {
    this.mascotaForm = this.fb.group({
      usuarioUid: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      tipo: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      raza: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      sexo: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      color: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      chip: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      peso: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
      categoria: ['', Validators.required],
      tieneVacunas: [false]
    });

    if (this.mascota) {
      this.mascotaForm.patchValue({
        usuarioUid: this.mascota.usuarioUid,
        nombre: this.mascota.nombre,
        tipo: this.mascota.tipo,
        raza: this.mascota.raza,
        sexo: this.mascota.sexo,
        fechaNacimiento: this.mascota.fechaNacimiento,
        color: this.mascota.color,
        chip: this.mascota.chip,
        peso: this.mascota.peso,
        categoria: this.mascota.categoria,
        tieneVacunas: this.mascota.tieneVacunas ?? false
      });
    }

    this.usuarios$ = this.firestore.collection('usuarios', ref => ref.where('tipo', '==', 'dueno')).valueChanges({ idField: 'uid' });
  }


    async guardar() {
      if (this.mascotaForm.invalid) {
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
        message: this.mascota ? 'Actualizando mascota...' : 'Guardando mascota...',
        spinner: 'crescent',
        backdropDismiss: false
      });
      await loading.present();

      const formValue = this.mascotaForm.value;
      const uid = formValue.usuarioUid;

      try {
        const usuarios = await firstValueFrom(this.usuarios$);
        const usuarioSeleccionado = usuarios.find(u => u.uid === uid);

        if (!usuarioSeleccionado) {
          await loading.dismiss();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Usuario no encontrado. Selecciona un dueño válido.',
            confirmButtonText: 'OK',
            heightAuto: false
          });
          return;
        }

        const mascotaGuardada: Mascota = {
          ...formValue,
          mid: this.mascota?.mid || this.generarMID(),
          dueno: {
            nombre: usuarioSeleccionado.nombre || '',
            contacto: usuarioSeleccionado.contacto || ''
          }
        };

        if (this.mascota && this.mascota.mid) {
          await this.firestore.doc(`mascotas/${this.mascota.mid}`).update({ 
            usuarioUid: mascotaGuardada.usuarioUid,
            nombre: mascotaGuardada.nombre,
            tipo: mascotaGuardada.tipo,
            raza: mascotaGuardada.raza,
            fechaNacimiento: mascotaGuardada.fechaNacimiento,
            peso: mascotaGuardada.peso,
            dueno: mascotaGuardada.dueno,
            sexo: this.mascotaForm.get('sexo')?.value || '',
            color: this.mascotaForm.get('color')?.value || '',
            chip: this.mascotaForm.get('chip')?.value || '',
            categoria: this.mascotaForm.get('categoria')?.value || '',
            tieneVacunas: this.mascotaForm.get('tieneVacunas')?.value || false
          });
        } else {
          await this.firestore.collection('mascotas').add(mascotaGuardada);
        }

        await loading.dismiss();

        await Swal.fire({
          icon: 'success',
          title: this.mascota ? 'Actualización exitosa' : 'Registro exitoso',
          text: this.mascota ? 'Mascota actualizada correctamente.' : 'Mascota guardada correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        });

        this.modalCtrl.dismiss(true);
      } catch (error) {
        console.error('Error al guardar mascota:', error);
        await loading.dismiss();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al guardar la mascota. Intenta nuevamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
      }
    }

    cerrar() {
      this.modalCtrl.dismiss(false);
    }

    generarMID() {
      return Math.random().toString(36).substring(2, 10);
    }

    onCategoriaChange() {
      const categoria = this.mascotaForm.get('categoria')?.value;
      if (categoria !== 'exotico') {
        this.mascotaForm.patchValue({ tieneVacunas: false });
      }
    }

  }

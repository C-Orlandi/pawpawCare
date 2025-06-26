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
      usuarioUid: [this.mascota?.usuarioUid || '', Validators.required],
      nombre: [this.mascota?.nombre || '', Validators.required],
      tipo: [this.mascota?.tipo || '', Validators.required],
      raza: [this.mascota?.raza || ''],
      fechaNacimiento: [this.mascota?.fechaNacimiento || '', Validators.required],
      edad: [this.mascota?.edad || ''],
      peso: [this.mascota?.peso || '']
    });

    // Con compat:
    this.usuarios$ = this.firestore.collection('usuarios').valueChanges({ idField: 'uid' });
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
        // Actualizar documento con compat
        await this.firestore.doc(`mascotas/${this.mascota.mid}`).update({ 
          usuarioUid: mascotaGuardada.usuarioUid,
          nombre: mascotaGuardada.nombre,
          tipo: mascotaGuardada.tipo,
          raza: mascotaGuardada.raza,
          fechaNacimiento: mascotaGuardada.fechaNacimiento,
          edad: mascotaGuardada.edad,
          peso: mascotaGuardada.peso,
          dueno: mascotaGuardada.dueno
        });
      } else {
        // Agregar nuevo documento con compat
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
}

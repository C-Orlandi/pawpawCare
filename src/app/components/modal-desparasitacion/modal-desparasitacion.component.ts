import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-desparasitacion',
  templateUrl: './modal-desparasitacion.component.html'
})
export class ModalDesparasitacionComponent implements OnInit {
  @Input() mid!: string; 
  @Input() desparasitacion: any;

  desparasitacionForm!: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.desparasitacionForm = this.fb.group({
      nombre: [
        this.desparasitacion?.nombre || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
        ]
      ],
      fechaHora: [this.desparasitacion?.fechayhora || '', Validators.required]
    });
  }

  async guardar() {
    if (this.desparasitacionForm.invalid || !this.mid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.desparasitacion ? 'Actualizando desparasitación...' : 'Guardando desparasitación...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    const formValue = this.desparasitacionForm.value;

    const desparasitacionGuardada = {
      nombre: formValue.nombre,
      fechayhora: formValue.fechaHora,
      mid: this.mid,
      estado: 'aplicada',
      creadaEn: new Date()
    };

    try {
      if (this.desparasitacion?.id_desp) {
        await this.firestore.doc(`desparasitacionesMascotas/${this.desparasitacion.id_desp}`).update(desparasitacionGuardada);
      } else {
        const docRef = await this.firestore.collection('desparasitacionesMascotas').add(desparasitacionGuardada);
        await this.firestore.doc(`desparasitacionesMascotas/${docRef.id}`).update({ id_desp: docRef.id });
      }

      await loading.dismiss();

      await Swal.fire({
        icon: 'success',
        title: this.desparasitacion ? 'Actualización exitosa' : 'Registro exitoso',
        text: this.desparasitacion ? 'Desparasitación actualizada correctamente.' : 'Desparasitación guardada correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });

      this.modalCtrl.dismiss(true);

    } catch (error) {
      await loading.dismiss();
      console.error('Error al guardar desparasitación:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar la desparasitación. Intenta nuevamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}

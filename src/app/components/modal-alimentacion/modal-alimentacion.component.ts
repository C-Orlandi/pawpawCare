import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-alimentacion',
  templateUrl: './modal-alimentacion.component.html'
})
export class ModalAlimentacionComponent implements OnInit {

  @Input() alimentacion?: any;
  @Input() mid!: string;

  alimentacionForm!: FormGroup;
  hoy = new Date().toISOString();

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.alimentacionForm = this.fb.group({
      fecha: [this.alimentacion?.fecha || this.hoy, Validators.required],
      tipoAlimento: [this.alimentacion?.tipoAlimento || '', Validators.required],
      nombreAlimento: [
        this.alimentacion?.nombreAlimento || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$')
        ]
      ],
      cantidad: [
        this.alimentacion?.cantidad || '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+([.,][0-9]+)?\\s?(g|kg)?$')
        ]
      ],
      metodo: [this.alimentacion?.metodo || '', Validators.required],
      comio: [this.alimentacion ? String(this.alimentacion.comio) : 'true', Validators.required],
      obsAdicionales: [this.alimentacion?.obsAdicionales || '', Validators.minLength(3)]
    });
  }

  async guardar() {
    if (this.alimentacionForm.invalid) {
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
      message: this.alimentacion ? 'Actualizando registro...' : 'Guardando registro...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    const formValue = this.alimentacionForm.value;
    const data = {
      ...formValue,
      mid: this.mid,
      comio: formValue.comio === 'true',
      creadaEn: new Date()
    };

    try {
      if (this.alimentacion?.aid) {
        await this.firestore.doc(`alimentacionMascotas/${this.alimentacion.aid}`).update(data);
      } else {
        const docRef = await this.firestore.collection('alimentacionMascotas').add(data);
        await this.firestore.doc(`alimentacionMascotas/${docRef.id}`).update({ aid: docRef.id });
      }

      await loading.dismiss();

      await Swal.fire({
        icon: 'success',
        title: this.alimentacion ? 'Actualización exitosa' : 'Registro exitoso',
        text: this.alimentacion ? 'Registro de alimentación actualizado correctamente.' : 'Registro de alimentación guardado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });

      this.modalCtrl.dismiss(true);

    } catch (error) {
      console.error('Error al guardar alimentación:', error);
      await loading.dismiss();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el registro. Inténtalo nuevamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}

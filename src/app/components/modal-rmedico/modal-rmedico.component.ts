import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-rmedico',
  templateUrl: './modal-rmedico.component.html',
  styleUrls: ['./modal-rmedico.component.scss']
})
export class ModalRmedicoComponent implements OnInit {
  @Input() registro: any;
  registroForm: FormGroup;
  hoy: string = new Date().toISOString();
  mascotaSeleccionada: any;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {
    this.registroForm = this.fb.group({
      fechaVisita: [this.hoy, Validators.required],
      motivo: ['',[Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ \\-]*$')]],
      veterinario: ['',[Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]*$')]],
      diagnostico: ['',[Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]*$')]],
      tratamiento: ['',[Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ,.()\\n\\r\\-]*$')]],
      medicamentos: ['',[Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ,.()\\n\\r\\-]*$')]]
    });
  }

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
    }

    if (this.registro) {
      this.registroForm.patchValue(this.registro);
    }
  }

  async guardarRegistro() {
    if (this.registroForm.invalid || !this.mascotaSeleccionada) {
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
      spinner: 'circles'
    });

    await loading.present();

    const data = this.registroForm.value;

    if (this.registro?.rid) {
      const registroData = {
        ...data,
        mid: this.mascotaSeleccionada.mid,
        creadoEn: this.registro.creadoEn || new Date()
      };

      try {
        await this.afs.collection('registrosMedicos').doc(this.registro.rid).update(registroData);

        await loading.dismiss();

        Swal.fire({
          icon: 'success',
          title: 'Registro Actualizado',
          text: 'El registro médico fue actualizado correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => this.modalController.dismiss(true));
      } catch (error) {
        console.error('Error al actualizar:', error);
        await loading.dismiss();
        this.mostrarMensajeDeError();
      }

      return;
    }

    const registroData = {
      ...data,
      mid: this.mascotaSeleccionada.mid,
      creadoEn: new Date()
    };

    try {
      const docRef = await this.afs.collection('registrosMedicos').add(registroData);
      await this.afs.collection('registrosMedicos').doc(docRef.id).update({ rid: docRef.id });

      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'Registro médico guardado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => this.modalController.dismiss(true));
    } catch (error) {
      console.error('Error al guardar:', error);
      await loading.dismiss();
      this.mostrarMensajeDeError();
    }
  }

  mostrarMensajeDeError() {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al guardar el registro. Intenta nuevamente.',
      confirmButtonText: 'OK',
      heightAuto: false
    });
  }

  cerrar() {
    this.modalController.dismiss(false);
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { ControlpycService } from 'src/app/services/controlpyc.service';

@Component({
  selector: 'app-modal-controlpyc',
  templateUrl: './modal-controlpyc.component.html',
  styleUrls: ['./modal-controlpyc.component.scss']
})
export class ModalControlpycComponent implements OnInit {
  @Input() control?: any;
  usuarios$!: Observable<any[]>;
  formulario!: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private controlService: ControlpycService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      usuarioUid: [this.control?.usuarioUid || '', Validators.required],
      fecha: [this.control?.fecha || new Date().toISOString(), Validators.required],
      peso: [this.control?.peso || '', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      unidad: [this.control?.unidad || '', Validators.required],
      condicionCorporal: [this.control?.condicionCorporal || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
      actividadFisica: [this.control?.actividadFisica || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
      observaciones: [this.control?.observaciones || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]]
    });

    this.usuarios$ = this.firestore.collection('usuarios').valueChanges({ idField: 'uid' });
  }

  async guardar() {
    if (this.formulario.invalid) {
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
      message: this.control ? 'Actualizando registro...' : 'Guardando registro...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    const formValue = this.formulario.value;
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

      const controlGuardado = {
        ...formValue,
        mid: this.control?.mid || this.generarMID(),
        dueno: {
          nombre: usuarioSeleccionado.nombre || '',
          contacto: usuarioSeleccionado.contacto || ''
        }
      };

      if (this.control && this.control.cid) {
        await this.controlService.actualizarControl(this.control.cid, controlGuardado);
      } else {
        await this.controlService.agregarControl(controlGuardado);
      }

      await loading.dismiss();

      await Swal.fire({
        icon: 'success',
        title: this.control ? 'Registro Actualizado' : 'Registro Exitoso',
        text: this.control ? 'El registro fue actualizado correctamente.' : 'El registro fue guardado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });

      this.modalCtrl.dismiss(true);
    } catch (error) {
      console.error('Error al guardar el control:', error);
      await loading.dismiss();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el registro. Intenta nuevamente.',
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

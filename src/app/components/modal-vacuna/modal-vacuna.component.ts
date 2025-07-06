import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { EmailService } from 'src/app/services/email.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-vacuna',
  templateUrl: './modal-vacuna.component.html',
  styleUrls: ['./modal-vacuna.component.scss']
})
export class ModalVacunaComponent implements OnInit {
  @Input() mid!: string;
  @Input() vacuna: any;

  usuarioLogin?: string;
  vacunaForm!: FormGroup;
  usuarioEmail: string = 'sin-correo@pawcare.com';

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private emailService: EmailService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.vacunaForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      fechaHora: [this.vacuna?.fechayhora || '', Validators.required]
    });

    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.uid;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }

  async guardarVacuna() {
    if (this.vacunaForm.invalid) {
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

    const formValue = this.vacunaForm.value;
    const formData = {
      nombre: formValue.nombre,
      fechayhora: formValue.fechaHora,
      mid: this.mid,
      uid: this.usuarioLogin || 'desconocido',
      creadaEn: new Date(),
      estado: 'aplicada',
    };

    try {
      let vacunaId = '';

      if (this.vacuna?.vid) {
        await this.afs.collection('vacunasMascotas').doc(this.vacuna.vid).update(formData);
        vacunaId = this.vacuna.vid;
      } else {
        const docRef = await this.afs.collection('vacunasMascotas').add(formData);
        vacunaId = docRef.id;
        await this.afs.collection('vacunasMascotas').doc(vacunaId).update({ vid: vacunaId });
      }

      await loading.dismiss();

      Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'Vacuna guardada correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        this.modalCtrl.dismiss(true);
      });

    } catch (error) {
      await loading.dismiss();
      console.error('🔥 Error al guardar vacuna:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar la vacuna. Intenta nuevamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

  exportarPDF() {
    const dataElement = document.getElementById('historial-content'); // el div que contiene el historial

    if (!dataElement) {
      console.error('No se encontró el contenedor del historial');
      return;
    }

    import('html2canvas').then(html2canvas => {
      import('jspdf').then(jsPDF => {
        html2canvas.default(dataElement).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(imgData);

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('historial_pawcare.pdf');
        });
      });
    });
  }

  cerrar() {
    this.modalCtrl.dismiss(false);
  }
}

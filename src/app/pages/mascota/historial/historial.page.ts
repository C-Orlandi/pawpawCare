import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { ModalRmedicoComponent } from 'src/app/components/modal-rmedico/modal-rmedico.component';
import { ExportarpdfService } from 'src/app/services/exportarpdf.service';
import Swal from 'sweetalert2';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss']
})
export class HistorialPage implements OnInit {
  registros$!: Observable<any[]>;
  registros: any[] = [];
  mascotaSeleccionada: any;

  constructor(
    private afs: AngularFirestore,
    private modalController: ModalController,
    private alertController: AlertController,
    private exportarpdf: ExportarpdfService,
    private loadingController: LoadingController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarRegistros();
    }
  }

  cargarRegistros() {
    this.registros$ = this.afs.collection('registrosMedicos', ref =>
      ref.where('mid', '==', this.mascotaSeleccionada?.mid)
         .orderBy('fechaVisita', 'desc')
    ).valueChanges({ idField: 'rid' });

    this.registros$.subscribe(data => this.registros = data);
  }

  async abrirModalRegistro() {
    const modal = await this.modalController.create({
      component: ModalRmedicoComponent,
      componentProps: { mid: this.mascotaSeleccionada.mid }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarRegistros();
    });

    await modal.present();
  }

  async editarRegistro(registro: any) {
    const modal = await this.modalController.create({
      component: ModalRmedicoComponent,
      componentProps: { registro }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.cargarRegistros();
    });

    await modal.present();
  }

  async eliminarRegistro(rid: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
              spinner: 'circles',
            });

            await loading.present();

            try {
              await this.afs.collection('registrosMedicos').doc(rid).delete();
              this.cargarRegistros();

              await loading.dismiss();

              Swal.fire({
                icon: 'success',
                title: 'Registro eliminado',
                text: 'El historial médico fue eliminado correctamente.',
                confirmButtonText: 'OK',
                heightAuto: false
              });
            } catch (error) {
              await loading.dismiss();

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar el registro.',
                confirmButtonText: 'OK',
                heightAuto: false
              });

              console.error('❌ Error eliminando registro:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL');
  }

  exportarPDF() {
    if (!this.registros || this.registros.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin historial médico',
        text: 'No hay registros para exportar.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    this.exportarpdf.exportarHistorialMedico(
      this.registros,
      this.mascotaSeleccionada?.nombre,
      this.formatearFecha
    );
  }

  goBack() {
  this.navCtrl.back();
  }

}

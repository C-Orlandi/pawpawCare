import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MascotaService } from '../../../services/mascota.service';
import { DuenoService } from 'src/app/services/dueno.service';
import { Mascota } from 'src/app/interfaces/mascota';
import { Dueno } from 'src/app/interfaces/dueno';
import { ModalMascotaComponent } from 'src/app/components/modal-mascota/modal-mascota.component';
import Swal from 'sweetalert2';
import { LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestionar-mascota',
  templateUrl: './gestionar-mascota.page.html',
  styleUrls: ['./gestionar-mascota.page.scss'],
})
export class GestionarMascotaPage implements OnInit {
  mascotas: any[] = [];
  duenosMap = new Map<string, string>();

  constructor(
    private mascotaService: MascotaService,
    private duenoService: DuenoService,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.duenoService.getDuenos().subscribe(duenos => {
      this.duenosMap.clear();
      duenos.forEach(d => {
        this.duenosMap.set(d.uid, d.nombre);
      });

      this.mascotaService.getMascotas().subscribe(mascotas => {
        this.mascotas = mascotas.map(m => ({
          ...m,
          nombreDueno: this.duenosMap.get(m.usuarioUid) || 'Desconocido'
        }));
      });
    });
  }

  async abrirModal(mascota?: Mascota) {
    const modal = await this.modalController.create({
      component: ModalMascotaComponent,
      componentProps: { mascota }
    });

    modal.onDidDismiss().then(result => {
      const mascotaModificada: Mascota = result.data;
      if (mascotaModificada) {
        if (mascota) {
          this.mascotaService.actualizarMascota(mascotaModificada);
        } else {
          this.mascotaService.crearMascota(mascotaModificada);
        }
      }
    });

    await modal.present();
  }

  async eliminarMascota(mid: string) {
  const confirmado = confirm('¿Seguro que quieres eliminar esta mascota?');
  if (!confirmado) return;

  const loading = await this.loadingController.create({
    message: 'Eliminando mascota...',
    spinner: 'crescent',
    backdropDismiss: false
  });
  await loading.present();

  try {
    await this.mascotaService.eliminarMascota(mid);
    await loading.dismiss();

    await Swal.fire({
      icon: 'success',
      title: 'Eliminación exitosa',
      text: 'Mascota eliminada correctamente.',
      confirmButtonText: 'OK',
      heightAuto: false
    });
  } catch (error) {
    await loading.dismiss();

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar la mascota. Intenta nuevamente.',
      confirmButtonText: 'OK',
      heightAuto: false
    });
  }
}

}

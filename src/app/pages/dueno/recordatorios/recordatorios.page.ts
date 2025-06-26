import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ModalRecordatorioComponent } from 'src/app/components/modal-recordatorio/modal-recordatorio.component';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss']
})
export class RecordatoriosPage implements OnInit {
  usuarioLogin?: string;
  uid?: string;
  recordatorios: any[] = [];

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
      this.uid = usuarioParsed.uid;
      this.cargarRecordatorios();
    }
  }

  async cargarRecordatorios() {
    if (!this.uid) return;

    this.afs.collection('recordatorios', ref => ref.where('uid', '==', this.uid))
      .valueChanges({ idField: 'rid' })
      .subscribe(async (data: any[]) => {
        const recordatoriosCompletos = await Promise.all(data.map(async (rec: any) => {
          // Obtener nombre de mascota
          const mascotaSnap = await firstValueFrom(
            this.afs.collection('mascotas', ref =>
              ref.where('mid', '==', rec['mid'])
            ).get()
          );
          rec['nombreMascota'] = (mascotaSnap.docs[0]?.data() as any)?.['nombre'] || 'Desconocida';

          // Determinar colección según tipo
          const col = rec['tipo'] === 'medicamento'
            ? 'medicamentosMascotas'
            : rec['tipo'] === 'vacuna'
              ? 'vacunasMascotas'
              : 'desparasitacionesMascotas';

          const snap = await firstValueFrom(
            this.afs.collection(col, ref =>
              ref.where('rid', '==', rec['rid'])
            ).get()
          );
          const docTipo = snap.docs[0]?.data() as any;

          rec['estado'] = docTipo?.['estado'] ?? 'pendiente';
          rec['dosis'] = docTipo?.['dosis'];
          rec['duracion'] = docTipo?.['duracion'];
          rec['frecuenciaHoras'] = docTipo?.['frecuenciaHoras'];
          rec['horaInicio'] = rec['fecha'];

          return rec;
        }));

        this.recordatorios = recordatoriosCompletos.filter(rec => rec['estado'] === 'pendiente');
      });
  }

  async abrirModalRecordatorio(recordatorio?: any) {
    const modal = await this.modalController.create({
      component: ModalRecordatorioComponent,
      componentProps: {
        recordatorioEdit: recordatorio,
        uid: this.uid
      }
    });

    modal.onDidDismiss().then(result => {
      if (result.data?.actualizado || result.data?.guardado) {
        this.cargarRecordatorios();
      }
    });

    await modal.present();
  }

  async eliminarRecordatorio(recordatorio: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar recordatorio?',
      message: `¿Seguro que deseas eliminar el recordatorio de tipo ${recordatorio.tipo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.procesarEliminacion(recordatorio)
        }
      ]
    });

    await alert.present();
  }

  async procesarEliminacion(recordatorio: any) {
    const rid = recordatorio.rid;
    const tipo = recordatorio.tipo;

    const loading = await this.loadingCtrl.create({
      message: 'Eliminando...',
      spinner: 'circles',
    });

    await loading.present();

    try {
      await this.afs.collection('recordatorios').doc(rid).delete();

      if (tipo === 'vacuna') {
        await this.borrarColeccionPorRid('vacunasMascotas', rid);
        await this.borrarColeccionPorRid('vacunasRecordatorios', rid);
      } else if (tipo === 'medicamento') {
        await this.borrarColeccionPorRid('medicamentosMascotas', rid);
        await this.borrarColeccionPorRid('medicamentosRecordatorios', rid);
      } else if (tipo === 'desparasitacion') {
        await this.borrarColeccionPorRid('desparasitacionesMascotas', rid);
        await this.borrarColeccionPorRid('desparasitacionRecordatorios', rid);
      }

      await loading.dismiss();

      await Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El recordatorio ha sido eliminado correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });

      this.enviarCorreoEliminacion(recordatorio);
      this.cargarRecordatorios();

    } catch (error) {
      console.error('❌ Error al eliminar recordatorio:', error);
      await loading.dismiss();

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el recordatorio.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

  private async borrarColeccionPorRid(nombreColeccion: string, rid: string) {
    const snapshot = await firstValueFrom(
      this.afs.collection(nombreColeccion, ref =>
        ref.where('rid', '==', rid)
      ).get()
    );

    const batch = this.afs.firestore.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  formatearFechaHora(fecha: string): string {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    const mes = (f.getMonth() + 1).toString().padStart(2, '0');
    const anio = f.getFullYear();
    const hora = f.getHours().toString().padStart(2, '0');
    const minutos = f.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
  }

  private async enviarCorreoEliminacion(recordatorio: any) {
    const payload = {
      email: 'correo@usuario.com',
      asunto: 'Recordatorio eliminado',
      cuerpo: `
        Se ha eliminado el siguiente recordatorio:
        Tipo: ${recordatorio.tipo}
        Mascota: ${recordatorio.nombreMascota || 'Desconocida'}
        Fecha: ${this.formatearFechaHora(recordatorio.fecha)}
        Estado: ${recordatorio.estado}
        Detalles adicionales: ${JSON.stringify(recordatorio)}
      `
    };

    try {
      await this.http.post('https://tu-backend.com/api/enviar-correo', payload).toPromise();
    } catch (error) {
      console.error('Error enviando correo eliminación:', error);
    }
  }
}

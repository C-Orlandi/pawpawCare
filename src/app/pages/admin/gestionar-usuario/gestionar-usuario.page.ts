import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from 'src/app/services/usuario.service'; // compat version
import { Usuario } from 'src/app/interfaces/usuario';
import { ModalUsuarioComponent } from 'src/app/components/modal-usuario/modal-usuario.component';
import Swal from 'sweetalert2';
import { MascotaService } from 'src/app/services/mascota.service';

@Component({
  selector: 'app-gestionar-usuario',
  templateUrl: './gestionar-usuario.page.html',
  styleUrls: ['./gestionar-usuario.page.scss']
})
export class GestionarUsuarioPage implements OnInit {

  usuarios: Usuario[] = [];

  constructor(
    private usuarioService: UsuariosService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private mascotaService: MascotaService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(data => {
      this.usuarios = data.filter(u => u.tipo === 'dueno');
    });
  }

  async abrirModal(usuario?: Usuario) {
    const modal = await this.modalController.create({
      component: ModalUsuarioComponent,
      componentProps: { usuario }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        // Después de crear o actualizar, recargamos la lista
        this.cargarUsuarios();
      }
    });

    await modal.present();
  }

  async eliminarUsuario(uid: string) {
    const confirmado = confirm('¿Seguro que quieres eliminar este usuario?');
    if (!confirmado) return;

    const loading = await this.loadingController.create({
      message: 'Eliminando usuario y sus mascotas...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    try {
      // 1. Elimina todas las mascotas del usuario
      await this.mascotaService.eliminarMascotasDeUsuario(uid);

      // 2. Elimina el usuario
      await this.usuarioService.eliminarUsuario(uid);

      await loading.dismiss();

      await Swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'Usuario y sus mascotas fueron eliminados correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });

      this.cargarUsuarios();

    } catch (error) {
      await loading.dismiss();

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar usuario o mascotas: ' + error,
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }


  getTipoLegible(tipo: string): string {
    switch (tipo) {
      case 'dueno': return 'Dueño';
      case 'admin': return 'Admin';
      case 'otro': return 'Otro';
      default: return tipo;
    }
  }

  goBack() {
    this.navCtrl.back();
  }
}

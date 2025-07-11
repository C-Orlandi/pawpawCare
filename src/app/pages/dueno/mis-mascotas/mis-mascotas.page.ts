import { Component } from '@angular/core';
import { MenuController, ActionSheetController, ToastController, NavController} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MascotaService } from 'src/app/services/mascota.service'; 

@Component({
  selector: 'app-mis-mascotas',
  templateUrl: './mis-mascotas.page.html',
  styleUrls: ['./mis-mascotas.page.scss']
})
export class MisMascotasPage {
  mascotas: any[] = [];
  usuarioLogin?: any;

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private menuController: MenuController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private mascotaService: MascotaService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    this.menuController.enable(true);

    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      this.usuarioLogin = JSON.parse(usuario);
    } else {
      console.warn('⚠️ No se encontró usuarioLogin en localStorage');
      return;
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'mascotaSeleccionada') {
        this.cargarMascotas();
      }
    });

    this.cargarMascotas();

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['updated']) {
        this.cargarMascotas();
      }
    });
  }

  precargarImagenesYEsperar(mascotas: any[]): Promise<any[]> {
    const promesas = mascotas.map((mascota) => {
      return new Promise<any>((resolve) => {
        if (!mascota.imagen) {
          return resolve(mascota); 
        }

        const img = new Image();
        img.src = mascota.imagen;

        img.onload = () => resolve(mascota);
        img.onerror = () => {
          console.warn('Error cargando imagen de mascota:', mascota.nombre);
          resolve(mascota); 
        };
      });
    });

    return Promise.all(promesas); 
  }

  async cargarMascotas() {
    if (!this.usuarioLogin?.uid) {
      console.error('UID de usuario no disponible');
      return;
    }

    this.mascotas = []; // Oculta tarjetas mientras carga

    this.mascotaService.getMascotasPorUsuario(this.usuarioLogin.uid).subscribe({
      next: async (mascotas) => {
        const cargadas = await this.precargarImagenesYEsperar(mascotas);
        this.mascotas = cargadas; 
      },
      error: (err) => {
        console.error('Error al cargar mascotas desde el servicio:', err);
      },
    });
  }

  agregarMascota() {
    this.router.navigate(['/registro-mascota']);
  }

  async mostrarOpcionesMascota(mascota: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: mascota.nombre,
      buttons: [
        {
          text: 'Ver Perfil',
          icon: 'eye',
          handler: () => {
            localStorage.setItem(
              'mascotaSeleccionada',
              JSON.stringify(mascota)
            );
            this.router.navigate(['/home-mascota']);
          },
        },
        {
          text: 'Editar',
          icon: 'create',
          handler: () => {
            localStorage.setItem(
              'mascotaSeleccionada',
              JSON.stringify(mascota)
            );
            this.router.navigate(['/registro-mascota'], {
              queryParams: { modo: 'editar' },
            });
          },
        },
        {
          text: 'Eliminar',
          icon: 'trash',
          role: 'destructive',
          handler: () => this.eliminarMascota(mascota.mid),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async eliminarMascota(mid: string) {
    try {
      await this.mascotaService.eliminarMascota(mid);
      await this.mostrarToast('Mascota eliminada.');
      this.cargarMascotas();
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      this.mostrarToast('Error al eliminar.');
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/userhome']);  
  }

}


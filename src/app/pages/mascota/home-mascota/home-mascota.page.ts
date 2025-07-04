import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home-mascota',
  templateUrl: './home-mascota.page.html',
  styleUrls: ['./home-mascota.page.scss']
})
export class HomeMascotaPage {
  mascota: any;
  esExotico = false;
  mostrarVacunas = false;

  constructor(private router: Router, private firestore: AngularFirestore, private http: HttpClient) {}

  ionViewWillEnter() {
    const data = localStorage.getItem('mascotaSeleccionada');
    if (data) {
      this.mascota = JSON.parse(data);
      this.esExotico = this.mascota?.categoria === 'exotico';
      this.mostrarVacunas = this.mascota?.categoria === 'domestico' || this.mascota?.tieneVacunas;
    }
  }

  async onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file || !this.mascota?.mid) return;

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const uploadRes: any = await this.http.post(`${environment.backendUrl.replace('/api', '')}/upload`, formData).toPromise();
      const nuevaUrl = uploadRes.url;

      await this.firestore.collection('mascotas').doc(this.mascota.mid).update({
        imagen: nuevaUrl
      });

      this.mascota.imagen = nuevaUrl;

      // Actualizar localStorage para que refleje cambio en home y mis-mascotas
      localStorage.setItem('mascotaSeleccionada', JSON.stringify(this.mascota));

    } catch (error) {
      console.error('Error al actualizar imagen:', error);
    }
  }

  goBack() {
    this.router.navigate(['/mis-mascotas'], { queryParams: { updated: '1' } });
  }
}
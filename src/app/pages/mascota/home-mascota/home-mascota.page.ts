import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-mascota',
  templateUrl: './home-mascota.page.html',
  styleUrls: ['./home-mascota.page.scss']
})
export class HomeMascotaPage {
  mascota: any;
  esExotico = false;
  mostrarVacunas = false;

  constructor(private router: Router) {}

  ionViewWillEnter() {
    const data = localStorage.getItem('mascotaSeleccionada');
    if (data) {
      this.mascota = JSON.parse(data);
      this.esExotico = this.mascota?.categoria === 'exotico';
      this.mostrarVacunas = this.mascota?.categoria === 'domestico' || this.mascota?.tieneVacunas;
    }
  }

  goTo(pagina: string) {
    this.router.navigateByUrl(`/${pagina}`);
  }
}
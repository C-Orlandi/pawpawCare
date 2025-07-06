import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular';
import { TemaService } from 'src/app/services/tema.service';

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.page.html',
  styleUrls: ['./adminhome.page.scss'],
})
export class AdminhomePage implements OnInit {

usuarioLogin?: string;

  constructor(private router: Router, private authService: AuthService, private navCtrl: NavController, private temaService: TemaService) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
    }
  }

  logout() {
    this.temaService.clearColor();
    this.temaService.setColor('toolbar-morado'); 
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule, NavController } from '@ionic/angular';
import { TemaService } from 'src/app/services/tema.service';

@Component({
  selector: 'app-perfil-menu',
  templateUrl: './perfil-menu.page.html',
  styleUrls: ['./perfil-menu.page.scss']
})
export class PerfilMenuPage implements OnInit {

  usuarioLogin?: string;
  fotoPerfil?: string;
  defaultAvatar: string = 'https://cdn-icons-png.flaticon.com/512/219/219983.png'; 

  constructor(private router: Router, private authService: AuthService, private navCtrl: NavController, private temaService: TemaService) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuarioLogin');
    const foto = localStorage.getItem('fotoPerfil');
    const savedColor = localStorage.getItem('toolbarColor');

    if (usuario) {
      const usuarioParsed = JSON.parse(usuario);
      this.usuarioLogin = usuarioParsed.nombre;
    }

    if (foto) {
      this.fotoPerfil = foto;
    }
  }

  logout() {
    this.temaService.clearColor(); 
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.fotoPerfil = base64;
      localStorage.setItem('fotoPerfil', base64);
    };
    reader.readAsDataURL(file);
  }

  goBack() {
  this.navCtrl.back();
  }
}
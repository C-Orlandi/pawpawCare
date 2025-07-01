import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

declare let navigator: any; // 👈 Agrega esto

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private location: Location,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentUrl = this.router.url;
      const rutasRaiz = ['/tabs/home', '/tabs', '/inicio', '/login'];

      if (rutasRaiz.includes(currentUrl)) {
        const alerta = await this.alertController.create({
          header: 'Salir de la app',
          message: '¿Deseas cerrar la aplicación?',
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Salir',
              role: 'destructive',
              handler: () => {
                navigator['app'].exitApp(); // 👈 Ya no marcará error
              }
            }
          ]
        });
        await alerta.present();
      } else {
        this.location.back();
      }
    });
  }
}

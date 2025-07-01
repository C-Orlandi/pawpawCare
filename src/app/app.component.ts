import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

declare let navigator: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
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
    private location: Location,
    private router: Router
  ) {
    this.initializeBackButton();
  }

  initializeBackButton() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        const currentUrl = this.router.url;

        if (currentUrl === '/home') {
          navigator['app'].exitApp(); // salir si estás en /home
        } else {
          this.location.back(); // retroceder
        }
      });
    });
  }
}

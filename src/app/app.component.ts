import { Component, Renderer2 } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TemaService } from './services/tema.service'; // Ajusta la ruta si es necesario

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

declare let navigator: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  private previousClass = '';

  constructor(
    private platform: Platform,
    private location: Location,
    private router: Router,
    private renderer: Renderer2,
    private temaService: TemaService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.initializeBackButton();
    this.loadUserThemeAndInit();
  }

  initializeBackButton() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        const currentUrl = this.router.url;

        if (currentUrl === '/home') {
          navigator['app'].exitApp(); 
        } else {
          this.location.back(); 
        }
      });
    });
  }

  initTema() {
    this.temaService.colorToolbar$.subscribe(colorClass => {
      if (this.previousClass) {
        this.renderer.removeClass(document.body, this.previousClass);
      }

      if (colorClass) {
        this.renderer.addClass(document.body, colorClass);
        this.previousClass = colorClass;
      }
    });
  }

  async loadUserThemeAndInit() {
    await this.platform.ready();

    this.afAuth.authState.subscribe(async user => {
      if (user) {
        const doc = await this.afs.collection('usuarios').doc(user.uid).get().toPromise();

        if (doc && doc.exists) {
          const data = doc.data() as { toolbarColor?: string };
          if (data?.toolbarColor) {
            this.temaService.setColor(data.toolbarColor);
          } else {
            this.temaService.setColor('toolbar-morado');
          }
        } else {
          this.temaService.setColor('toolbar-morado');
        }
      } else {
        this.temaService.setColor('toolbar-morado');
      }
      this.initTema();
    });
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilMenuPageRoutingModule } from './perfil-menu-routing.module';

import { PerfilMenuPage } from './perfil-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilMenuPageRoutingModule
  ],
  declarations: [PerfilMenuPage]
})
export class PerfilMenuPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeMascotaPageRoutingModule } from './home-mascota-routing.module';

import { HomeMascotaPage } from './home-mascota.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeMascotaPageRoutingModule
  ],
  declarations: [HomeMascotaPage]
})
export class HomeMascotaPageModule {}

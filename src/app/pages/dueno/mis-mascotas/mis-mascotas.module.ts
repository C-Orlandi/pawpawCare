import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisMascotasPageRoutingModule } from './mis-mascotas-routing.module';

import { MisMascotasPage } from './mis-mascotas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisMascotasPageRoutingModule
  ],
  declarations: [MisMascotasPage]
})
export class MisMascotasPageModule {}

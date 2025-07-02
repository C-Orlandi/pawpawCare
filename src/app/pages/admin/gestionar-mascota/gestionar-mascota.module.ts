import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarMascotaPageRoutingModule } from './gestionar-mascota-routing.module';

import { GestionarMascotaPage } from './gestionar-mascota.page';
import { ModalMascotaComponent } from 'src/app/components/modal-mascota/modal-mascota.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    GestionarMascotaPageRoutingModule
  ],
  declarations: [GestionarMascotaPage, ModalMascotaComponent]
})
export class GestionarMascotaPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarMascotaPageRoutingModule } from './gestionar-mascota-routing.module';

import { GestionarMascotaPage } from './gestionar-mascota.page';
import { ModalMascotaComponent } from 'src/app/components/modal-mascota/modal-mascota.component';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    GestionarMascotaPageRoutingModule
  ],
  declarations: [GestionarMascotaPage, ModalMascotaComponent, CapitalizarPipe]
})
export class GestionarMascotaPageModule {}

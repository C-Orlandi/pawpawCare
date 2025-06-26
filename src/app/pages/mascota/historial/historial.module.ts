import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialPageRoutingModule } from './historial-routing.module';

import { HistorialPage } from './historial.page';
import { ModalRmedicoComponent } from 'src/app/components/modal-rmedico/modal-rmedico.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HistorialPageRoutingModule
  ],
  declarations: [HistorialPage, ModalRmedicoComponent]
})
export class HistorialPageModule {}

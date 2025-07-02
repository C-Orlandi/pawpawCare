import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacunasPageRoutingModule } from './vacunas-routing.module';

import { VacunasPage } from './vacunas.page';
import { ModalVacunaComponent } from 'src/app/components/modal-vacuna/modal-vacuna.component';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    VacunasPageRoutingModule
  ],
  declarations: [VacunasPage, ModalVacunaComponent]
})
export class VacunasPageModule {}

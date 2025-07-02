import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordatoriosPageRoutingModule } from './recordatorios-routing.module';

import { RecordatoriosPage } from './recordatorios.page';
import { ModalRecordatorioComponent } from 'src/app/components/modal-recordatorio/modal-recordatorio.component';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RecordatoriosPageRoutingModule
  ],
  declarations: [RecordatoriosPage, ModalRecordatorioComponent, CapitalizarPipe]
})
export class RecordatoriosPageModule {}

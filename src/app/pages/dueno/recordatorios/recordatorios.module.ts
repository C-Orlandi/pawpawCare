import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordatoriosPageRoutingModule } from './recordatorios-routing.module';

import { RecordatoriosPage } from './recordatorios.page';
import { ModalRecordatorioComponent } from 'src/app/components/modal-recordatorio/modal-recordatorio.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RecordatoriosPageRoutingModule
  ],
  declarations: [RecordatoriosPage, ModalRecordatorioComponent]
})
export class RecordatoriosPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ControlpycPageRoutingModule } from './controlpyc-routing.module';

import { ControlpycPage } from './controlpyc.page';
import { ModalControlpycComponent } from 'src/app/components/modal-controlpyc/modal-controlpyc.component';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ControlpycPageRoutingModule
  ],
  declarations: [ControlpycPage, ModalControlpycComponent]
})
export class ControlpycPageModule {}

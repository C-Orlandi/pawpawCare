import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegalimentacionPageRoutingModule } from './regalimentacion-routing.module';

import { RegalimentacionPage } from './regalimentacion.page';
import { ModalAlimentacionComponent } from 'src/app/components/modal-alimentacion/modal-alimentacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RegalimentacionPageRoutingModule
  ],
  declarations: [RegalimentacionPage, ModalAlimentacionComponent]
})
export class RegalimentacionPageModule {}

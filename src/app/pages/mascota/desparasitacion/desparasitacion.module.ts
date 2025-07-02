import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DesparasitacionPageRoutingModule } from './desparasitacion-routing.module';

import { DesparasitacionPage } from './desparasitacion.page';
import { ModalDesparasitacionComponent } from 'src/app/components/modal-desparasitacion/modal-desparasitacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DesparasitacionPageRoutingModule
  ],
  declarations: [DesparasitacionPage, ModalDesparasitacionComponent]
})
export class DesparasitacionPageModule {}

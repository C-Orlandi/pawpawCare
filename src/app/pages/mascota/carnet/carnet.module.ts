import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarnetPageRoutingModule } from './carnet-routing.module';

import { CarnetPage } from './carnet.page';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarnetPageRoutingModule
  ],
  declarations: [CarnetPage, CapitalizarPipe]
})
export class CarnetPageModule {}

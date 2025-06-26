import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroMascotaPageRoutingModule } from './registro-mascota-routing.module';

import { RegistroMascotaPage } from './registro-mascota.page';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    ReactiveFormsModule,
    RegistroMascotaPageRoutingModule
  ],
  declarations: [RegistroMascotaPage]
})
export class RegistroMascotaPageModule {}

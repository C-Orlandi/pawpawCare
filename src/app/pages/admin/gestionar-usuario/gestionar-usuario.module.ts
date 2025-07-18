import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarUsuarioPageRoutingModule } from './gestionar-usuario-routing.module';

import { GestionarUsuarioPage } from './gestionar-usuario.page';
import { ModalUsuarioComponent } from 'src/app/components/modal-usuario/modal-usuario.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    GestionarUsuarioPageRoutingModule
  ],
  declarations: [GestionarUsuarioPage, ModalUsuarioComponent]
})
export class GestionarUsuarioPageModule {}

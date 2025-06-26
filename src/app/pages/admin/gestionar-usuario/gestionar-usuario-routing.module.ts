import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarUsuarioPage } from './gestionar-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarUsuarioPageRoutingModule {}

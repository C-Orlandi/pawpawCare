import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarMascotaPage } from './gestionar-mascota.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarMascotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarMascotaPageRoutingModule {}

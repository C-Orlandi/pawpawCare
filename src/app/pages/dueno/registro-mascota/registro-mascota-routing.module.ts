import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroMascotaPage } from './registro-mascota.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroMascotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroMascotaPageRoutingModule {}

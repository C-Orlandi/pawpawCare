import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeMascotaPage } from './home-mascota.page';

const routes: Routes = [
  {
    path: '',
    component: HomeMascotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeMascotaPageRoutingModule {}

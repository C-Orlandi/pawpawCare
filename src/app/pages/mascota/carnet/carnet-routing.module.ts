import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarnetPage } from './carnet.page';

const routes: Routes = [
  {
    path: '',
    component: CarnetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarnetPageRoutingModule {}

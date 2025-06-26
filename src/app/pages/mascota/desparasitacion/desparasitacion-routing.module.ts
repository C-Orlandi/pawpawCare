import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DesparasitacionPage } from './desparasitacion.page';

const routes: Routes = [
  {
    path: '',
    component: DesparasitacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DesparasitacionPageRoutingModule {}

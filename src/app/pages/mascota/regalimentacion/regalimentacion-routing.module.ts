import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegalimentacionPage } from './regalimentacion.page';

const routes: Routes = [
  {
    path: '',
    component: RegalimentacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegalimentacionPageRoutingModule {}

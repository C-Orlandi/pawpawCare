import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ControlpycPage } from './controlpyc.page';

const routes: Routes = [
  {
    path: '',
    component: ControlpycPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlpycPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserhomePage } from './userhome.page';

const routes: Routes = [
  {
    path: '',
    component: UserhomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserhomePageRoutingModule {}

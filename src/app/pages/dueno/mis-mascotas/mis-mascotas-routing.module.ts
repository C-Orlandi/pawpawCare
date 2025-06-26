import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisMascotasPage } from './mis-mascotas.page';

const routes: Routes = [
  {
    path: '',
    component: MisMascotasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisMascotasPageRoutingModule {}

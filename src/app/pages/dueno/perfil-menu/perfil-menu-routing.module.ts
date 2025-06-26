import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilMenuPage } from './perfil-menu.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilMenuPageRoutingModule {}

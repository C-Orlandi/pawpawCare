import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splashscreen',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/common/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/common/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'resetpassword',
    loadChildren: () => import('./pages/common/resetpassword/resetpassword.module').then( m => m.ResetpasswordPageModule)
  },
  {
    path: 'splashscreen',
    loadChildren: () => import('./pages/common/splashscreen/splashscreen.module').then( m => m.SplashscreenPageModule)
  },
  {
    path: 'adminhome',
    loadChildren: () => import('./pages/admin/adminhome/adminhome.module').then( m => m.AdminhomePageModule)
  },
  {
    path: 'gestionar-mascota',
    loadChildren: () => import('./pages/admin/gestionar-mascota/gestionar-mascota.module').then( m => m.GestionarMascotaPageModule)
  },
  {
    path: 'gestionar-usuario',
    loadChildren: () => import('./pages/admin/gestionar-usuario/gestionar-usuario.module').then( m => m.GestionarUsuarioPageModule)
  },
  {
    path: 'userhome',
    loadChildren: () => import('./pages/dueno/userhome/userhome.module').then( m => m.UserhomePageModule)
  },
  {
    path: 'registro-mascota',
    loadChildren: () => import('./pages/dueno/registro-mascota/registro-mascota.module').then( m => m.RegistroMascotaPageModule)
  },
  {
    path: 'recordatorios',
    loadChildren: () => import('./pages/dueno/recordatorios/recordatorios.module').then( m => m.RecordatoriosPageModule)
  },
  {
    path: 'perfil-usuario',
    loadChildren: () => import('./pages/dueno/perfil-usuario/perfil-usuario.module').then( m => m.PerfilUsuarioPageModule)
  },
  {
    path: 'perfil-menu',
    loadChildren: () => import('./pages/dueno/perfil-menu/perfil-menu.module').then( m => m.PerfilMenuPageModule)
  },
  {
    path: 'mis-mascotas',
    loadChildren: () => import('./pages/dueno/mis-mascotas/mis-mascotas.module').then( m => m.MisMascotasPageModule)
  },
  {
    path: 'geolocalizacion',
    loadChildren: () => import('./pages/dueno/geolocalizacion/geolocalizacion.module').then( m => m.GeolocalizacionPageModule)
  },
  {
    path: 'configuraciones',
    loadChildren: () => import('./pages/dueno/configuraciones/configuraciones.module').then( m => m.ConfiguracionesPageModule)
  },
  {
    path: 'vacunas',
    loadChildren: () => import('./pages/mascota/vacunas/vacunas.module').then( m => m.VacunasPageModule)
  },
  {
    path: 'regalimentacion',
    loadChildren: () => import('./pages/mascota/regalimentacion/regalimentacion.module').then( m => m.RegalimentacionPageModule)
  },
  {
    path: 'home-mascota',
    loadChildren: () => import('./pages/mascota/home-mascota/home-mascota.module').then( m => m.HomeMascotaPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./pages/mascota/historial/historial.module').then( m => m.HistorialPageModule)
  },
  {
    path: 'desparasitacion',
    loadChildren: () => import('./pages/mascota/desparasitacion/desparasitacion.module').then( m => m.DesparasitacionPageModule)
  },
  {
    path: 'controlpyc',
    loadChildren: () => import('./pages/mascota/controlpyc/controlpyc.module').then( m => m.ControlpycPageModule)
  },
  {
    path: 'carnet',
    loadChildren: () => import('./pages/mascota/carnet/carnet.module').then( m => m.CarnetPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

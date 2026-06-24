import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ReservarComponent } from './pages/reservar/reservar.component';
import { IniciarsesionComponent } from './pages/iniciarsesion/iniciarsesion.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { MisreservasComponent } from './pages/misreservas/misreservas.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ConfirmarCorreoComponent } from './pages/confirmar-correo/confirmar-correo.component';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'reservar',
    component: ReservarComponent
  },

  {
    path: 'reservar/:id',
    component: ReservarComponent
  },

  {
    path: 'iniciarsesion',
    component: IniciarsesionComponent
  },

  {
    path: 'registrar',
    component: RegistrarComponent
  },

  {
    path: 'confirmar-correo',
    component: ConfirmarCorreoComponent
  },

  {
    path: 'misreservas',
    component: MisreservasComponent
  },

  {
    path: 'contacto',
    component: ContactoComponent
  }

];
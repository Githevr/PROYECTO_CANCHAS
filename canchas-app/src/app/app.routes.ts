import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ReservarComponent } from './pages/reservar/reservar.component';
import { IniciarsesionComponent } from './pages/iniciarsesion/iniciarsesion.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { MisreservasComponent } from './pages/misreservas/misreservas.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ConfirmarCorreoComponent } from './pages/confirmar-correo/confirmar-correo.component';
import { RealizarPagoComponent } from './pages/realizar-pago/realizar-pago.component';

// Importación de Guards de Seguridad
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

// Importación de Componentes del Propietario ("Soy Dueño")
import { DashboardComponent } from './pages/propietario/dashboard/dashboard.component';
import { MisComplejosComponent } from './pages/propietario/mis-complejos/mis-complejos.component';
import { MisCreditosComponent } from './pages/propietario/mis-creditos/mis-creditos.component';

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
    component: MisreservasComponent,
    canActivate: [authGuard] // Protegida para cualquier usuario autenticado
  },

  {
    path: 'realizar-pago/:id',
    component: RealizarPagoComponent,
    canActivate: [authGuard]
  },

  {
    path: 'contacto',
    component: ContactoComponent
  },

  // RUTA: Dashboard / Panel de Reservas del Propietario (Protegido por Rol)
  {
    path: 'propietario/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROPIETARIO'] }
  },

  // RUTA: Gestión de Complejos Deportivos y Canchas del Propietario (Protegido por Rol)
  {
    path: 'propietario/mis-complejos',
    component: MisComplejosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROPIETARIO'] }
  },

  // RUTA: Monedero y Recarga de Créditos del Propietario (Protegido por Rol)
  {
    path: 'propietario/mis-creditos',
    component: MisCreditosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PROPIETARIO'] }
  },

  // Redirección por defecto si la ruta no existe
  {
    path: '**',
    redirectTo: ''
  }

];
import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ReservarComponent } from './pages/reservar/reservar.component';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'reservar/:id',
    component: ReservarComponent
  }

];
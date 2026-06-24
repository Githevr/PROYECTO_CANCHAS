import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DatePickerComponent } from '../shared/date-picker/date-picker.component';
import { TimePickerComponent } from '../shared/time-picker/time-picker.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    DatePickerComponent,
    TimePickerComponent,
    FormsModule
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  constructor(
    private router: Router
  ) {}

  // UBICACIONES
  ubicaciones = [
    'Todos',
    'Lima',
    'Trujillo',
    'Arequipa',
    'Cusco',
    'Piura',
    'Chiclayo',
    'Tacna',
    'Ica',
    'Huancayo',
    'Cajamarca',
    'Puno',
    'Chimbote',
    'Tarapoto',
    'Huaraz'
  ];

  ubicacionSeleccionada = 'Todos';

  // DEPORTES
  deportes = [
    'Todos',
    'Fútbol',
    'Voley',
    'Tenis',
    'Básquet',
    'Balonmano'
  ];

  deporteSeleccionado = 'Todos';

  // FILTROS
  fechaSeleccionada = '';
  horaSeleccionada = '';

  // BUSCAR
  buscarCanchas() {

    this.router.navigate(
      ['/reservar'],
      {
        queryParams: {
          ubicacion: this.ubicacionSeleccionada,
          deporte: this.deporteSeleccionado,
          fecha: this.fechaSeleccionada,
          hora: this.horaSeleccionada
        }
      }
    );

  }

}
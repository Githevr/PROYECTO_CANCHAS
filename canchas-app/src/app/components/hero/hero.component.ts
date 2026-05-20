import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../shared/date-picker/date-picker.component';
import { TimePickerComponent } from '../shared/time-picker/time-picker.component';

@Component({
  selector: 'app-hero',
  imports: [DatePickerComponent, TimePickerComponent, FormsModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  // 1. Ubicación (Google Maps)
  nombreUbicacion = 'Balón de Oro';
  // 1.2. Codificamos la dirección (esto convierte los espacios en %20 para que la URL no se rompa)
  busquedaCodificada = encodeURIComponent('Canchas Balón de Oro, Trujillo, Perú');

  // 1.3. Armamos la URL final que irá en el href
  mapUrl = `https://www.google.com/maps/search/?api=1&query=${this.busquedaCodificada}`;

  // 2. Deportes disponibles
  deportes = ['Fútbol', 'Voley', 'Tenis', 'Básquet', 'Balonmano'];
  deporteSeleccionado = 'Fútbol'; // Valor por defecto

  // 3. Método para buscar (Se conectará a la BD después)
  buscarCanchas() {
    console.log('Buscando canchas para:', this.deporteSeleccionado);
    // Aquí luego inyectaremos un servicio para llamar a tu backend
  }

  fechaSeleccionada = '';
  horaSeleccionada = '';
}

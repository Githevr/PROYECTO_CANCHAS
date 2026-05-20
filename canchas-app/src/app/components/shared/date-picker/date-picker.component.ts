import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css'
})
export class DatePickerComponent {
  // Recibe la fecha del padre
  @Input() fecha: string = ''; 
  // Emite el cambio al padre (necesario para el two-way binding)
  @Output() fechaChange = new EventEmitter<string>();

  onFechaCambiada(nuevaFecha: string) {
    this.fecha = nuevaFecha;
    this.fechaChange.emit(this.fecha);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.css'
})
export class TimePickerComponent {
  @Input() hora: string = ''; 
  @Output() horaChange = new EventEmitter<string>();

  onHoraCambiada(nuevaHora: string) {
    this.hora = nuevaHora;
    this.horaChange.emit(this.hora);
  }
}
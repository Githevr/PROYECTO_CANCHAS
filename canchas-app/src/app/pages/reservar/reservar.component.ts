import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar.component.html'
})
export class ReservarComponent implements OnInit {

  canchaId: number = 0;

  reserva = {
    nombreCliente: '',
    fecha: '',
    hora: '',
    canchaId: 0
  };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.canchaId = Number(this.route.snapshot.paramMap.get('id'));
    this.reserva.canchaId = this.canchaId;
  }

  guardarReserva() {
    this.api.crearReserva(this.reserva).subscribe(() => {
      alert('Reserva guardada');
    });
  }
}
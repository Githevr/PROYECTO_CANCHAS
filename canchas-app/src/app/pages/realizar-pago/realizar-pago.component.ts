import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-realizar-pago',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.css']
})

export class RealizarPagoComponent implements OnInit {

  reserva: any = null;

  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {

    const idReserva =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.reservaService
      .getReserva(idReserva)
      .subscribe({

        next: (data) => {

          this.reserva = data;

          this.cargando = false;

        },

        error: () => {

          this.cargando = false;

        }

      });

  }

}
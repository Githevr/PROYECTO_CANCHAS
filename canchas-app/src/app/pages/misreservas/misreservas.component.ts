import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../model/reserva.model';

@Component({
  selector: 'app-misreservas',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent
  ],

  templateUrl: './misreservas.component.html',
  styleUrl: './misreservas.component.css'
})

export class MisreservasComponent implements OnInit {

  reservas: Reserva[] = [];

  constructor(
    public authService: AuthService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {

    const usuario = this.authService.obtenerUsuarioActual();

    if (usuario) {
      this.reservas = this.reservaService.getReservasPorUsuario(usuario.email);
    }

  }

}

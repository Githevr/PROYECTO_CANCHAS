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

  mensaje = '';
  cargando = true;

  constructor(
    public authService: AuthService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {

    const usuario =
      this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.cargando = false;
      this.mensaje = 'Debes iniciar sesión';
      return;
    }

    this.reservaService
      .getReservasPorUsuario(usuario.id)
      .subscribe({

        next: (data) => {

          this.reservas = data;
          this.cargando = false;

        },

        error: (error) => {

          console.error(error);

          this.mensaje =
            'Error al cargar las reservas';

          this.cargando = false;

        }

      });

  }

}
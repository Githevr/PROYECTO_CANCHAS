import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ReservaService, CanchaLocal } from '../../services/reserva.service';

@Component({
  selector: 'app-reservar',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent
  ],

  templateUrl: './reservar.component.html',
  styleUrl: './reservar.component.css'
})

export class ReservarComponent implements OnInit {

  canchas: CanchaLocal[] = [];

  // Filtros
  fechaSeleccionada: string = '';
  precioMaximo: number = 0;

  // Selección
  canchaSeleccionada: CanchaLocal | null = null;
  horariosDisponibles: string[] = [];
  horaSeleccionada: string = '';

  // Mensaje
  mensaje: string = '';
  tipoMensaje: string = '';

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canchas = this.reservaService.getCanchas();

    // Fecha mínima: hoy
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    this.fechaSeleccionada = `${anio}-${mes}-${dia}`;

    this.actualizarDisponibilidad();
  }

  get canchasFiltradas(): CanchaLocal[] {

    let resultado = this.canchas;

    if (this.precioMaximo > 0) {
      resultado = resultado.filter(c => c.precio <= this.precioMaximo);
    }

    return resultado;

  }

  seleccionarCancha(cancha: CanchaLocal) {

    this.canchaSeleccionada = cancha;
    this.horaSeleccionada = '';
    this.mensaje = '';
    this.actualizarDisponibilidad();

  }

  actualizarDisponibilidad() {

    if (this.canchaSeleccionada && this.fechaSeleccionada) {
      this.horariosDisponibles = this.reservaService.getHorariosDisponibles(
        this.canchaSeleccionada.id,
        this.fechaSeleccionada
      );
      // Si la hora seleccionada ya no está disponible, resetear
      if (!this.horariosDisponibles.includes(this.horaSeleccionada)) {
        this.horaSeleccionada = '';
      }
    }

  }

  onFechaChange() {
    this.horaSeleccionada = '';
    this.actualizarDisponibilidad();
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
    this.mensaje = '';
  }

  confirmarReserva() {

    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.mensaje = 'Debes iniciar sesión para reservar.';
      this.tipoMensaje = 'error';
      return;
    }

    if (!this.canchaSeleccionada) {
      this.mensaje = 'Selecciona una cancha.';
      this.tipoMensaje = 'error';
      return;
    }

    if (!this.fechaSeleccionada) {
      this.mensaje = 'Selecciona una fecha.';
      this.tipoMensaje = 'error';
      return;
    }

    if (!this.horaSeleccionada) {
      this.mensaje = 'Selecciona un horario disponible.';
      this.tipoMensaje = 'error';
      return;
    }

    // Verificar disponibilidad en tiempo real
    if (this.reservaService.estaOcupado(
      this.canchaSeleccionada.id,
      this.fechaSeleccionada,
      this.horaSeleccionada
    )) {
      this.mensaje = 'Este horario acaba de ser reservado. Selecciona otro.';
      this.tipoMensaje = 'error';
      this.actualizarDisponibilidad();
      return;
    }

    // Registrar reserva
    this.reservaService.registrarReserva({
      canchaId: this.canchaSeleccionada.id,
      canchaName: this.canchaSeleccionada.nombre,
      canchaImagen: this.canchaSeleccionada.imagen,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      precio: this.canchaSeleccionada.precio,
      usuarioEmail: usuario.email
    });

    this.mensaje = '¡Reserva registrada exitosamente! Redirigiendo a contacto...';
    this.tipoMensaje = 'exito';

    setTimeout(() => {
      this.router.navigate(['/contacto']);
    }, 1500);

  }

}
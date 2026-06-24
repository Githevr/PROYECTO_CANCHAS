import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Habilita ngModel para el modal de validación
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { ReservaService } from '../../../services/reserva.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  propietarioId!: number;
  reservas: any[] = [];
  
  // Analytics
  totalReservas: number = 0;
  pendientesAdelanto: number = 0;
  confirmadas: number = 0;

  // Feedback
  mensaje: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;

  // Validación de Comprobantes (Modal)
  mostrarValidacionModal: boolean = false;
  reservaParaValidar: any = null;
  checkIngresoVerificado: boolean = false;
  checkMontoCorrecto: boolean = false;

  constructor(
    public authService: AuthService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (usuario) {
      this.propietarioId = usuario.id;
      this.cargarReservas();
    }
  }

  cargarReservas(): void {
    this.reservaService.getReservasPorPropietario(this.propietarioId).subscribe({
      next: (res) => {
        this.reservas = res;
        this.calcularEstadisticas();
      },
      error: (err) => console.error('Error al cargar reservas:', err)
    });
  }

  calcularEstadisticas(): void {
    this.totalReservas = this.reservas.length;
    this.pendientesAdelanto = this.reservas.filter(r => r.estado === 'PENDIENTE_ADELANTO').length;
    this.confirmadas = this.reservas.filter(r => r.estado === 'CONFIRMADA').length;
  }

  confirmarAdelanto(reservaId: number): void {
    this.cargando = true;
    this.mensaje = '';

    this.reservaService.confirmarReserva(reservaId, this.propietarioId).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = '¡Reserva confirmada exitosamente! Se ha debitado la comisión del 8% de tu saldo.';
        this.tipoMensaje = 'exito';
        
        // Actualizar los créditos en el localStorage local para sincronizar el navbar de inmediato
        const nuevoSaldo = this.authService.obtenerCreditos() - res.comisionAplicada;
        this.authService.actualizarCreditos(nuevoSaldo);

        this.cargarReservas();
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = err.error || 'No se pudo confirmar la reserva. Verifique su saldo de créditos.';
        this.tipoMensaje = 'error';
      }
    });
  }

  finalizarPago(reservaId: number): void {
    this.cargando = true;
    this.mensaje = '';

    this.reservaService.finalizarReserva(reservaId, this.propietarioId).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = '¡Reserva completada! Pago al 100% verificado.';
        this.tipoMensaje = 'exito';
        this.cargarReservas();
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = err.error || 'No se pudo completar la reserva.';
        this.tipoMensaje = 'error';
      }
    });
  }

  liberarInasistencia(reservaId: number): void {
    this.cargando = true;
    this.mensaje = '';

    this.reservaService.liberarReserva(reservaId, this.propietarioId).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = 'La reserva ha sido liberada por tardanza. El horario queda disponible para el público.';
        this.tipoMensaje = 'exito';
        this.cargarReservas();
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = err.error || 'No se pudo liberar el campo deportivo.';
        this.tipoMensaje = 'error';
      }
    });
  }

  // Getters para dividir la bandeja de solicitudes y la agenda activa
  get solicitudesPendientes(): any[] {
    return this.reservas.filter(r => r.estado === 'PENDIENTE_ADELANTO');
  }

  get agendaReservas(): any[] {
    return this.reservas.filter(r => r.estado !== 'PENDIENTE_ADELANTO');
  }

  // Métodos del Modal de Validación
  abrirValidacion(reserva: any): void {
    this.reservaParaValidar = reserva;
    this.checkIngresoVerificado = false;
    this.checkMontoCorrecto = false;
    this.mostrarValidacionModal = true;
  }

  cerrarValidacion(): void {
    this.mostrarValidacionModal = false;
    this.reservaParaValidar = null;
  }

  confirmarDesdeValidacion(): void {
    if (this.reservaParaValidar) {
      const id = this.reservaParaValidar.id;
      this.cerrarValidacion();
      this.confirmarAdelanto(id);
    }
  }
}

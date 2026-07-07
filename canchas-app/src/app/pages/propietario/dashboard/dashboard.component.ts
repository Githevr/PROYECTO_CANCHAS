import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Habilita ngModel para el modal de validación
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { ReservaService } from '../../../services/reserva.service';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule],
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
  reservasPerdidas: number = 0;

  // Feedback
  mensaje: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;

  // Validación de Comprobantes (Modal)
  mostrarValidacionModal: boolean = false;
  reservaParaValidar: any = null;
  checkIngresoVerificado: boolean = false;
  checkMontoCorrecto: boolean = false;

  // Strikes y Apelaciones
  strikes: any[] = [];
  mostrarModalApelacion: boolean = false;
  strikeParaApelar: any = null;
  motivoApelacion: string = '';
  evidenciaApelacionFile: File | null = null;
  enviandoApelacion: boolean = false;
  mostrarAlertaStrikes: boolean = false;
  strikesPendientesCount: number = 0;
  mostrarNotificaciones: boolean = false;

  constructor(
    public authService: AuthService,
    private reservaService: ReservaService,
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (usuario) {
      this.propietarioId = usuario.id;
      this.cargarReservas();
      this.cargarStrikes();
      this.cargarReservasPerdidas();
    }
  }

  cargarReservasPerdidas(): void {
    this.http.get<any>(`http://localhost:8080/clientes/${this.propietarioId}/reservas-perdidas`).subscribe({
      next: (res) => this.reservasPerdidas = res.reservasPerdidas,
      error: (err) => console.error('Error cargando reservas perdidas', err)
    });
  }

  resetReservasPerdidas(): void {
    this.http.post(`http://localhost:8080/clientes/${this.propietarioId}/reset-reservas-perdidas`, {}).subscribe({
      next: () => this.reservasPerdidas = 0,
      error: (err) => console.error('Error reseteando reservas perdidas', err)
    });
  }

  irARecargar(): void {
    this.resetReservasPerdidas();
    this.router.navigate(['/propietario/mis-creditos']);
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path.startsWith('/') ? '' : '/'}${path}`;
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
    return this.reservas.filter(r => r.estado === 'PENDIENTE_ADELANTO' || r.estado === 'ESPERANDO_CONFIRMACION');
  }

  get agendaReservas(): any[] {
    return this.reservas.filter(r => r.estado !== 'PENDIENTE_ADELANTO' && r.estado !== 'ESPERANDO_CONFIRMACION');
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

  // =========================================================================
  // MÉTODOS: Strikes y Apelaciones
  // =========================================================================

  cargarStrikes() {
    this.http.get<any[]>(`http://localhost:8080/api/strikes/propietario/${this.propietarioId}`).subscribe({
      next: (data) => {
        this.strikes = data;
        const emitidos = this.strikes.filter(s => s.estado === 'EMITIDO');
        if (emitidos.length > 0) {
          this.toastService.mostrar(`Tienes ${emitidos.length} strike(s) nuevo(s) por revisar. Por favor apélalos.`, 'error');
          this.mostrarAlertaStrikes = true;
          this.strikesPendientesCount = emitidos.length;
        }
      },
      error: (err) => console.error('Error cargando strikes', err)
    });
  }

  get strikesEmitidos(): any[] {
    return this.strikes.filter(s => s.estado === 'EMITIDO');
  }

  get strikesActivosCount(): number {
    return this.strikes.filter(s => ['EMITIDO', 'APELADO', 'MANTENIDO'].includes(s.estado)).length;
  }

  scrollAStrikes(): void {
    this.mostrarNotificaciones = false; // cerrar menu si estaba abierto
    const el = document.getElementById('panel-strikes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  abrirApelacion(strike: any) {
    this.strikeParaApelar = strike;
    this.mostrarModalApelacion = true;
    this.motivoApelacion = '';
    this.evidenciaApelacionFile = null;
  }

  cerrarApelacion() {
    this.mostrarModalApelacion = false;
    this.strikeParaApelar = null;
  }

  onApelacionFileSelected(event: any) {
    this.evidenciaApelacionFile = event.target.files[0];
  }

  enviarApelacion() {
    if (!this.motivoApelacion.trim()) {
      this.toastService.mostrar('Debes escribir un motivo de apelación.', 'error');
      return;
    }

    this.enviandoApelacion = true;

    if (this.evidenciaApelacionFile) {
      const formData = new FormData();
      formData.append('file', this.evidenciaApelacionFile);
      this.http.post<any>('http://localhost:8080/api/reportes/upload', formData).subscribe({
        next: (res) => this.enviarPeticionApelacion(res.url),
        error: () => {
          this.toastService.mostrar('Error al subir evidencia de apelación.', 'error');
          this.enviandoApelacion = false;
        }
      });
    } else {
      this.enviarPeticionApelacion('');
    }
  }

  private enviarPeticionApelacion(urlEvidencia: string) {
    const payload = new URLSearchParams();
    payload.set('propietarioId', this.propietarioId.toString());
    payload.set('motivoApelacion', this.motivoApelacion);
    if (urlEvidencia) {
      payload.set('urlEvidenciaApelacion', urlEvidencia);
    }

    this.http.post(`http://localhost:8080/api/strikes/${this.strikeParaApelar.id}/apelar`, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe({
      next: () => {
        this.toastService.mostrar('Apelación enviada correctamente.', 'success');
        this.cargarStrikes();
        this.cerrarApelacion();
        this.enviandoApelacion = false;
      },
      error: (err) => {
        this.toastService.mostrar('Error enviando apelación: ' + err.error, 'error');
        this.enviandoApelacion = false;
      }
    });
  }
}

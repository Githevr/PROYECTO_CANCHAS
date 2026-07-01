import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ReservaService, CanchaLocal, HorarioDTO } from '../../services/reserva.service';

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
  preselectedCanchaId: number | null = null;

  // FILTROS
  fechaSeleccionada: string = '';
  precioMaximo: number = 0;

  ubicacionSeleccionada: string = '';
  deporteSeleccionado: string = '';
  horaFiltro: string = '';

  // SELECCIÓN
  canchaSeleccionada: CanchaLocal | null = null;
  horariosDisponibles: HorarioDTO[] = [];
  horaSeleccionada: string = '';

  // MENSAJE
  mensaje: string = '';
  tipoMensaje: string = '';

  // MODAL DE DETALLES
  mostrarDetallesModal: boolean = false;
  canchaParaDetalles: CanchaLocal | null = null;
  imagenActivaIndex: number = 0;

  // MODAL DE CALIFICACIONES
  mostrarCalificacionModal: boolean = false;
  reservaPendienteCalificar: any = null;
  calificacionData = { puntuacion: 0, comentario: '' };

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    this.fechaSeleccionada = `${anio}-${mes}-${dia}`;

    this.route.queryParams.subscribe(params => {
      this.ubicacionSeleccionada = params['ubicacion'] || '';
      this.deporteSeleccionado = params['deporte'] || '';
      this.fechaSeleccionada = params['fecha'] || this.fechaSeleccionada;
      this.horaFiltro = params['hora'] || '';
      
      const canchaId = params['canchaId'];
      if (canchaId) {
        this.preselectedCanchaId = Number(canchaId);
      }
    });

    this.reservaService.getCanchas().subscribe({
      next: (data) => {
        this.canchas = data;
        // Si viene una cancha preseleccionada desde el inicio, la activamos automáticamente
        if (this.preselectedCanchaId) {
          const encontrada = this.canchas.find(c => c.id === this.preselectedCanchaId);
          if (encontrada) {
            this.canchaSeleccionada = encontrada;
            this.actualizarDisponibilidad();
          }
        }
      },
      error: () => {
        this.mensaje = 'Error cargando canchas';
        this.tipoMensaje = 'error';
      }
    });

    const usuario = this.authService.obtenerUsuarioActual();
    if (usuario) {
      this.reservaService.getReservaPendienteCalificar(usuario.id).subscribe({
        next: (reserva) => {
          if (reserva) {
            this.reservaPendienteCalificar = reserva;
            this.mostrarCalificacionModal = true;
          }
        },
        error: () => {} // Si falla o no hay contenido (204), no hacemos nada
      });
    }
  }

  get canchasFiltradas(): CanchaLocal[] {

  let resultado = [...this.canchas];

  // FILTRO POR PRECIO
  if (this.precioMaximo > 0) {
    resultado = resultado.filter(
      c => c.precio <= this.precioMaximo
    );
  }

  // FILTRO POR DEPORTE
  if (
    this.deporteSeleccionado &&
    this.deporteSeleccionado !== 'Todos'
  ) {

    resultado = resultado.filter(
      c =>
        c.tipo.toLowerCase() ===
        this.deporteSeleccionado.toLowerCase()
    );

  }

  // FILTRO POR UBICACION (SOPORTA LEGAJO Y COMPLEJOS POR CIUDAD)
  if (
    this.ubicacionSeleccionada &&
    this.ubicacionSeleccionada !== 'Todos'
  ) {

    resultado = resultado.filter(
      c =>
        c.ubicacion.toLowerCase().includes(this.ubicacionSeleccionada.toLowerCase()) ||
        (c.complejo && c.complejo.ciudad.toLowerCase().includes(this.ubicacionSeleccionada.toLowerCase()))
    );

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

  if (
    this.canchaSeleccionada &&
    this.fechaSeleccionada
  ) {

    this.reservaService
      .getHorariosDisponibles(
        this.canchaSeleccionada.id,
        this.fechaSeleccionada
      )
      .subscribe({

        next: (horarios) => {

          this.horariosDisponibles = horarios;

          const seleccionValida = this.horariosDisponibles.some(
            h => h.hora === this.horaSeleccionada && h.estado === 'LIBRE'
          );

          if (!seleccionValida) {
            this.horaSeleccionada = '';
          }

        },

        error: () => {

          this.horariosDisponibles = [];

        }

      });

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
  calcularHoraFin(
  horaInicio: string
): string {

  const hora =
    Number(
      horaInicio.split(':')[0]
    );

  const siguienteHora =
    hora + 1;

  return `${siguienteHora
    .toString()
    .padStart(2, '0')}:00`;

}

  confirmarReserva() {

  const usuario =
    this.authService.obtenerUsuarioActual();

  if (!usuario) {

    this.mensaje =
      'Debes iniciar sesión para reservar.';

    this.tipoMensaje = 'error';
    return;
  }

  if (!this.canchaSeleccionada) {

    this.mensaje =
      'Selecciona una cancha.';

    this.tipoMensaje = 'error';
    return;
  }

  if (!this.fechaSeleccionada) {

    this.mensaje =
      'Selecciona una fecha.';

    this.tipoMensaje = 'error';
    return;
  }

  if (!this.horaSeleccionada) {

    this.mensaje =
      'Selecciona un horario disponible.';

    this.tipoMensaje = 'error';
    return;
  }

  const reservaRequest = {

    clienteId: usuario.id,

    canchaId:
      this.canchaSeleccionada.id,

    fecha:
      this.fechaSeleccionada,

    horaInicio:
      this.horaSeleccionada,

    horaFin:
      this.calcularHoraFin(
        this.horaSeleccionada
      ),

    monto:
      this.canchaSeleccionada.precio,

    metodoPago:
      'YAPE'

  };

  this.reservaService
    .registrarReserva(
      reservaRequest
    )
    .subscribe({

      next: (reserva) => {

        this.mensaje =
          '¡Reserva registrada exitosamente!';

        this.tipoMensaje =
          'exito';

        this.actualizarDisponibilidad();

        setTimeout(() => {

          this.router.navigate([
          '/realizar-pago',
          reserva.id
        ]);

        }, 1500);

      },

      error: (error) => {

        this.mensaje =
          error.error?.message ||
          'Horario ocupado o error al reservar.';

        this.tipoMensaje =
          'error';

      }

    });

  }

  obtenerImagenUrl(imagen: string): string {
    if (!imagen) return '/images/cancha_placeholder.jpg';
    if (imagen.startsWith('/uploads/')) {
      return 'http://localhost:8080' + imagen;
    }
    return imagen;
  }

  // --- LOGICA DE CALIFICACIONES ---
  seleccionarEstrella(puntaje: number) {
    this.calificacionData.puntuacion = puntaje;
  }

  saltarCalificacion() {
    this.mostrarCalificacionModal = false;
  }

  enviarCalificacion() {
    if (this.calificacionData.puntuacion === 0) {
      alert('Por favor selecciona una puntuación.');
      return;
    }
    if (!this.calificacionData.comentario.trim()) {
      alert('Por favor agrega un comentario.');
      return;
    }

    const payload = {
      reservaId: this.reservaPendienteCalificar.id,
      clienteId: this.authService.obtenerUsuarioActual().id,
      puntuacion: this.calificacionData.puntuacion,
      comentario: this.calificacionData.comentario
    };

    this.reservaService.guardarCalificacion(payload).subscribe({
      next: () => {
        this.mostrarCalificacionModal = false;
        alert('¡Gracias por tu calificación!');
      },
      error: () => {
        alert('Ocurrió un error al enviar la calificación.');
      }
    });
  }

  // MÉTODOS PARA MODAL DE DETALLES
  abrirDetalles(cancha: CanchaLocal, event: Event) {
    event.stopPropagation(); // Evita seleccionar la cancha al hacer clic en el botón de detalles
    this.canchaParaDetalles = cancha;
    this.imagenActivaIndex = 0;
    this.mostrarDetallesModal = true;
  }

  cerrarDetalles() {
    this.mostrarDetallesModal = false;
    this.canchaParaDetalles = null;
  }

  siguienteImagen() {
    if (this.canchaParaDetalles) {
      const imagenes = this.obtenerTodasLasImagenes(this.canchaParaDetalles);
      if (imagenes.length > 0) {
        this.imagenActivaIndex = (this.imagenActivaIndex + 1) % imagenes.length;
      }
    }
  }

  anteriorImagen() {
    if (this.canchaParaDetalles) {
      const imagenes = this.obtenerTodasLasImagenes(this.canchaParaDetalles);
      if (imagenes.length > 0) {
        this.imagenActivaIndex = (this.imagenActivaIndex - 1 + imagenes.length) % imagenes.length;
      }
    }
  }

  obtenerTodasLasImagenes(cancha: CanchaLocal): string[] {
    const urls: string[] = [];
    if (cancha.imagen) {
      urls.push(this.obtenerImagenUrl(cancha.imagen));
    }
    if (cancha.imagenes && cancha.imagenes.length > 0) {
      cancha.imagenes.forEach(img => {
        const resolved = this.obtenerImagenUrl(img);
        if (!urls.includes(resolved)) {
          urls.push(resolved);
        }
      });
    }
    if (urls.length === 0) {
      urls.push('/images/cancha_placeholder.jpg');
    }
    return urls;
  }

  obtenerBeneficiosLista(beneficiosString: string): string[] {
    if (!beneficiosString) return [];
    return beneficiosString.split(',').map(b => b.trim()).filter(b => b.length > 0);
  }

  seleccionarDesdeDetalles(cancha: CanchaLocal) {
    this.seleccionarCancha(cancha);
    this.cerrarDetalles();
    // Scroll suave hasta el panel de reserva
    setTimeout(() => {
      const panel = document.querySelector('.reserva-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}
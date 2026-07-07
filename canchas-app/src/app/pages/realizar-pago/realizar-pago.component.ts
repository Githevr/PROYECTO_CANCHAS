import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReservaService } from '../../services/reserva.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-realizar-pago',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterLink,
    FormsModule
  ],
  templateUrl: './realizar-pago.component.html',
  styleUrls: ['./realizar-pago.component.css']
})

export class RealizarPagoComponent implements OnInit, OnDestroy {

  reserva: any = null;
  cargando = true;
  tipoPago: '50' | '100' = '50'; // Controla si se paga el 50% o el 100%

  // Temporizador de 10 minutos para completar el adelanto
  tiempoRestante: number = 600; // 10 minutos en segundos
  tiempoFormateado: string = '10:00';
  intervaloId: any;
  tiempoExpirado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private reservaService: ReservaService,
    private router: Router,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Restaurar el scroll al inicio de la página automáticamente
    window.scrollTo(0, 0);

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
          
          if (this.reserva && this.reserva.estado === 'PENDIENTE_ADELANTO') {
            if (this.reserva.fechaExpiracionBloqueo) {
              const expiracion = new Date(this.reserva.fechaExpiracionBloqueo).getTime();
              const ahora = new Date().getTime();
              const diferenciaSegundos = Math.floor((expiracion - ahora) / 1000);
              
              if (diferenciaSegundos > 0) {
                this.tiempoRestante = diferenciaSegundos;
              } else {
                this.tiempoRestante = 0;
                this.tiempoExpirado = true;
              }
            } else {
               this.tiempoRestante = 600;
            }
            this.iniciarTemporizador();
          }

        },

        error: () => {

          this.cargando = false;

        }

      });

  }

  ngOnDestroy(): void {
    // Destruir el intervalo para evitar fugas de memoria al salir de la pantalla
    if (this.intervaloId) {
      clearInterval(this.intervaloId);
    }
  }

  iniciarTemporizador(): void {
    if (this.intervaloId) {
      clearInterval(this.intervaloId);
    }

    this.intervaloId = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        this.tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      } else {
        this.tiempoExpirado = true;
        clearInterval(this.intervaloId);
        
        // Ejecutar Rollback Automático porque se acabó el tiempo
        if (this.reserva && this.reserva.estado === 'PENDIENTE_ADELANTO') {
          this.reservaService.cancelarReserva(this.reserva.id, this.reserva.cliente.id).subscribe({
            next: () => {
              this.toastService.mostrar('El tiempo expiró. La reserva fue cancelada automáticamente.', 'error', 5000);
              this.router.navigate(['/misreservas']);
            },
            error: () => {
              this.toastService.mostrar('El tiempo expiró. Ocurrió un problema liberando la cancha.', 'error', 5000);
              this.router.navigate(['/misreservas']);
            }
          });
        }
      }
    }, 1000);
  }

  // Variables para la subida de comprobante
  numeroOperacion: string = '';
  comprobanteFile: File | null = null;
  enviandoComprobante: boolean = false;

  onComprobanteSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.comprobanteFile = file;
    }
  }

  enviarComprobante(): void {
    if (!this.reserva) return;
    if (!this.numeroOperacion.trim()) {
      this.toastService.mostrar('Por favor, ingresa el número de operación.', 'error');
      return;
    }
    if (!this.comprobanteFile) {
      this.toastService.mostrar('Por favor, selecciona la imagen del comprobante.', 'error');
      return;
    }

    this.enviandoComprobante = true;
    const formData = new FormData();
    formData.append('file', this.comprobanteFile);

    // 1. Subir imagen
    this.http.post<any>('http://localhost:8080/api/reportes/upload', formData).subscribe({
      next: (uploadRes) => {
        const urlComprobante = uploadRes.url;
        
        // 2. Vincular comprobante a la reserva
        this.http.post(`http://localhost:8080/reservas/${this.reserva.id}/subir-comprobante`, null, {
          params: {
            numeroOperacion: this.numeroOperacion,
            urlComprobante: urlComprobante
          }
        }).subscribe({
          next: () => {
            this.enviandoComprobante = false;
            // Detener el temporizador de bloqueo ya que se envió el pago
            if (this.intervaloId) {
              clearInterval(this.intervaloId);
            }
            this.reserva.estado = 'ESPERANDO_CONFIRMACION';
            this.toastService.mostrar('Comprobante enviado exitosamente al propietario.', 'success', 5000);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          error: (err) => {
            this.enviandoComprobante = false;
            this.toastService.mostrar(err.error || 'Error al vincular el comprobante.', 'error');
          }
        });
      },
      error: () => {
        this.enviandoComprobante = false;
        this.toastService.mostrar('Ocurrió un error al subir el archivo.', 'error');
      }
    });
  }

  mostrarConfirmacionCancelacion: boolean = false;

  cancelando: boolean = false;

  confirmarCancelacion(): void {
    if (!this.reserva || !this.reserva.cliente) {
      this.router.navigate(['/misreservas']);
      return;
    }

    this.cancelando = true;
    
    // Detener el temporizador de inmediato
    if (this.intervaloId) {
      clearInterval(this.intervaloId);
    }

    this.reservaService.cancelarReserva(this.reserva.id, this.reserva.cliente.id).subscribe({
      next: () => {
        this.toastService.mostrar('Reserva cancelada (rollback exitoso).', 'success', 3000);
        this.router.navigate(['/misreservas']);
      },
      error: () => {
        this.toastService.mostrar('Hubo un error al cancelar la reserva.', 'error', 3000);
        this.cancelando = false;
        // Si hay error, reiniciamos el temporizador por seguridad
        this.iniciarTemporizador();
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
}
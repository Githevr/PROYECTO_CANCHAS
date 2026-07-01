import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-realizar-pago',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterLink
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
    private router: Router
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
        
        // Redirigir porque se acabó el tiempo
        if (this.reserva.estado === 'PENDIENTE_ADELANTO') {
          alert('El tiempo para realizar el pago de esta reserva ha expirado.');
          this.router.navigate(['/misreservas']);
        }
      }
    }, 1000);
  }

  // Genera un enlace de WhatsApp directo al dueño con los datos de la reserva y el tipo de pago (50% o 100%)
  obtenerEnlaceWhatsApp(): string {
    if (!this.reserva) return '';
    const complejo = this.reserva.cancha.complejo;
    const telefono = complejo ? complejo.telefonoContacto : '987654321';
    const canchaNombre = this.reserva.cancha.nombre;
    const complejoNombre = complejo ? complejo.nombre : 'Complejo';
    const fecha = this.reserva.fecha;
    const hora = `${this.reserva.horaInicio.substring(0, 5)} - ${this.reserva.horaFin.substring(0, 5)}`;
    const total = this.reserva.precioTotal || this.reserva.cancha.precio;
    const montoPago = this.tipoPago === '50' ? (total / 2) : total;
    const tipoPagoTexto = this.tipoPago === '50' ? 'adelanto del 50% de garantía' : 'pago completo del 100%';
    const clienteNombre = this.reserva.cliente ? this.reserva.cliente.nombre : 'Cliente';
    
    const texto = `Hola, acabo de realizar la reserva de la cancha *${canchaNombre}* en el complejo *${complejoNombre}* para el día *${fecha}* en el horario *${hora}* a través de PlayField.\n\nAdjunto el comprobante del ${tipoPagoTexto} (S/ ${montoPago.toFixed(2)}). Mi nombre es *${clienteNombre}*. Quedo a la espera de su confirmación. ¡Muchas gracias!`;
    return `https://wa.me/51${telefono}?text=${encodeURIComponent(texto)}`;
  }

  obtenerImagenUrl(imagen: string): string {
    if (!imagen) return '/images/cancha_placeholder.jpg';
    if (imagen.startsWith('/uploads/')) {
      return 'http://localhost:8080' + imagen;
    }
    return imagen;
  }
}
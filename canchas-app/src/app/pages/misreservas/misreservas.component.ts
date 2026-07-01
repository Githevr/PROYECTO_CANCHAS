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

  reservas: any[] = [];

  mensaje = '';
  cargando = true;

  // MODAL DE DETALLES
  mostrarDetallesModal: boolean = false;
  reservaParaDetalles: any = null;
  imagenActivaIndex: number = 0;

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

  obtenerImagenUrl(imagen: string): string {
    if (!imagen) return '/images/cancha_placeholder.jpg';
    if (imagen.startsWith('/uploads/')) {
      return 'http://localhost:8080' + imagen;
    }
    return imagen;
  }

  // MÉTODOS PARA MODAL DE DETALLES
  abrirDetalles(reserva: any, event: Event) {
    event.stopPropagation();
    this.reservaParaDetalles = reserva;
    this.imagenActivaIndex = 0;
    this.mostrarDetallesModal = true;
  }

  cerrarDetalles() {
    this.mostrarDetallesModal = false;
    this.reservaParaDetalles = null;
  }

  siguienteImagen() {
    if (this.reservaParaDetalles && this.reservaParaDetalles.cancha) {
      const imagenes = this.obtenerTodasLasImagenes(this.reservaParaDetalles.cancha);
      if (imagenes.length > 0) {
        this.imagenActivaIndex = (this.imagenActivaIndex + 1) % imagenes.length;
      }
    }
  }

  anteriorImagen() {
    if (this.reservaParaDetalles && this.reservaParaDetalles.cancha) {
      const imagenes = this.obtenerTodasLasImagenes(this.reservaParaDetalles.cancha);
      if (imagenes.length > 0) {
        this.imagenActivaIndex = (this.imagenActivaIndex - 1 + imagenes.length) % imagenes.length;
      }
    }
  }

  obtenerTodasLasImagenes(cancha: any): string[] {
    const urls: string[] = [];
    if (cancha && cancha.imagen) {
      urls.push(this.obtenerImagenUrl(cancha.imagen));
    }
    if (cancha && cancha.imagenes && cancha.imagenes.length > 0) {
      cancha.imagenes.forEach((img: string) => {
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

  obtenerEnlaceWhatsApp(reserva: any): string {
    if (!reserva || !reserva.cancha || !reserva.cancha.complejo) return '';
    const complejo = reserva.cancha.complejo;
    const telefono = complejo.telefonoContacto || '987654321';
    const texto = `Hola, quiero confirmar mi reserva de la cancha *${reserva.cancha.nombre}* para la fecha *${reserva.fecha}*.`;
    return `https://wa.me/51${telefono}?text=${encodeURIComponent(texto)}`;
  }

}
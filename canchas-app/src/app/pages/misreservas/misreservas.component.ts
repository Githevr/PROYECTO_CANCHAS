import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../model/reserva.model';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-misreservas',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FormsModule
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

  // MODAL REPORTE
  mostrarReporteModal: boolean = false;
  reservaParaReporte: any = null;
  reporteMotivo: string = '';
  evidencias: { [key: number]: File } = {};
  enviandoReporte: boolean = false;

  constructor(
    public authService: AuthService,
    private reservaService: ReservaService,
    private toastService: ToastService,
    private http: HttpClient
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

  // =========================================================
  // LÓGICA DE REPORTES
  // =========================================================
  
  abrirModalReporte(reserva: any, event: Event) {
    event.stopPropagation();
    this.reservaParaReporte = reserva;
    this.mostrarReporteModal = true;
    this.reporteMotivo = '';
    this.evidencias = {};
  }

  cerrarReporte() {
    this.mostrarReporteModal = false;
    this.reservaParaReporte = null;
  }

  onFileSelected(event: any, indice: number) {
    const file = event.target.files[0];
    if (file) {
      this.evidencias[indice] = file;
    }
  }

  enviarReporte() {
    if (!this.reporteMotivo.trim()) {
      this.toastService.mostrar('Debes escribir un motivo detallado.', 'error');
      return;
    }

    if (!this.evidencias[1]) {
      this.toastService.mostrar('Debes adjuntar al menos la primera evidencia (Obligatoria).', 'error');
      return;
    }

    this.enviandoReporte = true;

    // Subir archivos primero
    const subidas = [
      this.subirArchivo(this.evidencias[1]),
      this.evidencias[2] ? this.subirArchivo(this.evidencias[2]) : Promise.resolve(null),
      this.evidencias[3] ? this.subirArchivo(this.evidencias[3]) : Promise.resolve(null)
    ];

    Promise.all(subidas).then(urls => {
      // urls[0] es urlEvidencia1
      const payload = new URLSearchParams();
      payload.set('jugadorId', this.authService.obtenerUsuarioActual().id.toString());
      payload.set('motivo', this.reporteMotivo);
      payload.set('urlEvidencia1', urls[0]!);
      
      if (urls[1]) payload.set('urlEvidencia2', urls[1]);
      if (urls[2]) payload.set('urlEvidencia3', urls[2]);

      this.http.post('http://localhost:8080/reservas/' + this.reservaParaReporte.id + '/reportar', payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).subscribe({
        next: () => {
          this.toastService.mostrar('Reporte enviado correctamente. El administrador revisará tu caso.', 'success');
          this.cerrarReporte();
          this.enviandoReporte = false;
        },
        error: (err) => {
          this.toastService.mostrar('Error al enviar reporte: ' + (err.error || err.message), 'error');
          this.enviandoReporte = false;
        }
      });
    }).catch(err => {
      this.toastService.mostrar('Error al subir los archivos de evidencia.', 'error');
      this.enviandoReporte = false;
    });
  }

  private subirArchivo(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post<any>('http://localhost:8080/api/reportes/upload', formData).subscribe({
        next: (res) => resolve(res.url),
        error: (err) => reject(err)
      });
    });
  }
}
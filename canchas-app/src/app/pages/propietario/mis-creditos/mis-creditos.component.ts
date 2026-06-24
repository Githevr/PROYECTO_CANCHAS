import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CreditoService } from '../../../services/credito.service';

@Component({
  selector: 'app-mis-creditos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './mis-creditos.component.html',
  styleUrl: './mis-creditos.component.css'
})
export class MisCreditosComponent implements OnInit {

  propietarioId!: number;
  saldoActual: number = 0.00;
  esPrimera: boolean = true;

  // Formulario de Recarga
  montoRecarga: number = 50;
  metodoPago: string = 'YAPE';
  nroOperacion: string = '';
  imagenComprobante: string = '';
  vistaPreviaCreditos: number = 50;

  // Listados
  recargas: any[] = [];
  historial: any[] = [];

  // Mensajes de feedback
  mensaje: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;

  constructor(
    public authService: AuthService,
    private creditoService: CreditoService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (usuario) {
      this.propietarioId = usuario.id;
      this.saldoActual = this.authService.obtenerCreditos();
      this.cargarDatos();
      this.actualizarSimulacion();
    }
  }

  cargarDatos(): void {
    // 1. Obtener si es primera recarga
    this.creditoService.esPrimeraRecarga(this.propietarioId).subscribe({
      next: (res) => {
        this.esPrimera = res;
        this.actualizarSimulacion();
      }
    });

    // 2. Obtener historial de solicitudes de recarga
    this.creditoService.obtenerRecargas(this.propietarioId).subscribe({
      next: (res) => this.recargas = res,
      error: (err) => console.error('Error al cargar recargas:', err)
    });

    // 3. Obtener historial de movimientos de crédito
    this.creditoService.obtenerHistorial(this.propietarioId).subscribe({
      next: (res) => this.historial = res,
      error: (err) => console.error('Error al cargar historial:', err)
    });
  }

  actualizarSimulacion(): void {
    if (this.montoRecarga < 50) {
      this.vistaPreviaCreditos = 0;
      return;
    }

    // El cálculo de la vista previa en el front simula el comportamiento seguro del backend
    if (this.esPrimera) {
      this.vistaPreviaCreditos = this.montoRecarga * 2;
    } else {
      if (this.montoRecarga >= 200) {
        this.vistaPreviaCreditos = this.montoRecarga + 50;
      } else if (this.montoRecarga >= 100) {
        this.vistaPreviaCreditos = this.montoRecarga + 20;
      } else {
        this.vistaPreviaCreditos = this.montoRecarga;
      }
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Simulación de carga de archivo guardando el nombre del archivo
      this.imagenComprobante = file.name;
    }
  }

  solicitarRecarga(): void {
    if (this.montoRecarga < 50) {
      this.mensaje = 'El monto mínimo de recarga es S/ 50.00.';
      this.tipoMensaje = 'error';
      return;
    }

    if (!this.nroOperacion) {
      this.mensaje = 'Por favor, ingrese el número de operación.';
      this.tipoMensaje = 'error';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    const request = {
      propietarioId: this.propietarioId,
      monto: this.montoRecarga,
      metodoPago: this.metodoPago,
      nroOperacion: this.nroOperacion,
      imagenComprobante: this.imagenComprobante || 'comprobante_recarga.png' // Valor por defecto si no subió archivo
    };

    this.creditoService.solicitarRecarga(request).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = '¡Solicitud de recarga enviada exitosamente! El administrador la verificará en unos minutos.';
        this.tipoMensaje = 'exito';
        
        // Resetear campos del formulario
        this.nroOperacion = '';
        this.imagenComprobante = '';
        this.montoRecarga = 50;

        // Recargar listas para ver la nueva solicitud pendiente
        this.cargarDatos();
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = err.error || 'Ocurrió un error al procesar su recarga.';
        this.tipoMensaje = 'error';
      }
    });
  }
}

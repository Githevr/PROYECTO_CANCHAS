import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  // Pestaña activa del panel
  tabActiva: string = 'duenos';

  // =========================================================================
  // SECCIÓN: Gestión de Dueños
  // =========================================================================
  duenos: any[] = [];
  busquedaDueno: string = '';
  duenoSeleccionado: any = null;
  montoCreditos: number = 0;
  descripcionCreditos: string = '';
  mensajeCreditos: string = '';

  // =========================================================================
  // SECCIÓN: Verificaciones KYB
  // =========================================================================
  complejosPendientes: any[] = [];

  // =========================================================================
  // SECCIÓN: Controversias / Reportes
  // =========================================================================
  reportesPendientes: any[] = [];
  reporteSeleccionado: any = null;
  resolucionTexto: string = '';

  // =========================================================================
  // SECCIÓN: Strikes y Apelaciones
  // =========================================================================
  apelacionesPendientes: any[] = [];
  mostrarModalStrike: boolean = false;
  reporteParaStrike: any = null;
  motivoStrike: string = '';
  evidenciaStrikeFile: File | null = null;
  enviandoStrike: boolean = false;

  // =========================================================================
  // SECCIÓN: Recargas de Créditos (Dueño -> Admin)
  // =========================================================================
  recargasPendientes: any[] = [];
  mostrarModalConfirmacionRecarga: boolean = false;
  accionConfirmacionRecarga: 'aprobar' | 'rechazar' | null = null;
  recargaIdSeleccionada: number | null = null;

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {
    this.cargarDuenos();
    this.cargarComplejosPendientes();
    this.cargarReportesPendientes();
    this.cargarApelaciones();
    this.cargarRecargasPendientes();
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // =========================================================================
  // MÉTODOS: Gestión de Dueños
  // =========================================================================

  cargarDuenos(): void {
    const url = this.busquedaDueno
      ? `${this.apiUrl}/admin/duenos?search=${encodeURIComponent(this.busquedaDueno)}`
      : `${this.apiUrl}/admin/duenos`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => this.duenos = data,
      error: (err) => console.error('Error cargando dueños:', err)
    });
  }

  buscarDuenos(): void {
    this.cargarDuenos();
  }

  seleccionarDueno(dueno: any): void {
    this.duenoSeleccionado = dueno;
    this.montoCreditos = 0;
    this.descripcionCreditos = '';
    this.mensajeCreditos = '';
  }

  agregarCreditos(): void {
    if (this.montoCreditos <= 0) return;
    this.http.post<any>(
      `${this.apiUrl}/admin/creditos/agregar?duenoId=${this.duenoSeleccionado.id}&monto=${this.montoCreditos}&descripcion=${encodeURIComponent(this.descripcionCreditos)}`,
      {}
    ).subscribe({
      next: (res) => {
        this.mensajeCreditos = `✅ ${res.mensaje}. Nuevo saldo: S/ ${res.nuevoSaldo}`;
        this.duenoSeleccionado.creditos = res.nuevoSaldo;
        this.montoCreditos = 0;
      },
      error: (err) => this.mensajeCreditos = '❌ Error: ' + (err.error || 'No se pudo completar')
    });
  }

  quitarCreditos(): void {
    if (this.montoCreditos <= 0) return;
    this.http.post<any>(
      `${this.apiUrl}/admin/creditos/quitar?duenoId=${this.duenoSeleccionado.id}&monto=${this.montoCreditos}&descripcion=${encodeURIComponent(this.descripcionCreditos)}`,
      {}
    ).subscribe({
      next: (res) => {
        this.mensajeCreditos = `✅ ${res.mensaje}. Nuevo saldo: S/ ${res.nuevoSaldo}`;
        this.duenoSeleccionado.creditos = res.nuevoSaldo;
        this.montoCreditos = 0;
      },
      error: (err) => this.mensajeCreditos = '❌ Error: ' + (err.error || 'No se pudo completar')
    });
  }

  // =========================================================================
  // MÉTODOS: Verificaciones KYB
  // =========================================================================

  cargarComplejosPendientes(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/complejos/pendientes`).subscribe({
      next: (data) => this.complejosPendientes = data,
      error: (err) => console.error('Error cargando complejos:', err)
    });
  }

  aprobarComplejo(id: number): void {
    this.http.post(`${this.apiUrl}/admin/complejos/${id}/aprobar`, {}).subscribe({
      next: () => {
        this.complejosPendientes = this.complejosPendientes.filter(c => c.id !== id);
        this.toastService.mostrar('✅ Complejo aprobado exitosamente', 'success');
      },
      error: (err) => this.toastService.mostrar('Error: ' + err.error, 'error')
    });
  }

  rechazarComplejo(id: number): void {
    this.http.post(`${this.apiUrl}/admin/complejos/${id}/rechazar`, {}).subscribe({
      next: () => {
        this.complejosPendientes = this.complejosPendientes.filter(c => c.id !== id);
        this.toastService.mostrar('⛔ Complejo rechazado', 'success');
      },
      error: (err) => this.toastService.mostrar('Error: ' + err.error, 'error')
    });
  }


  // =========================================================================
  // MÉTODOS: Controversias / Reportes
  // =========================================================================

  cargarReportesPendientes(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/reportes`).subscribe({
      next: (data) => this.reportesPendientes = data,
      error: (err) => console.error('Error cargando reportes:', err)
    });
  }

  resolverAFavor(reporteId: number): void {
    if (!this.resolucionTexto.trim()) {
      this.toastService.mostrar('Debes escribir la resolución antes de confirmar.', 'error');
      return;
    }
    this.http.post(`${this.apiUrl}/admin/reportes/${reporteId}/favor?resolucion=${encodeURIComponent(this.resolucionTexto)}`, {}).subscribe({
      next: () => {
        this.reportesPendientes = this.reportesPendientes.filter(r => r.id !== reporteId);
        this.resolucionTexto = '';
        this.reporteSeleccionado = null;
        this.toastService.mostrar('Resolución enviada (a favor del jugador).', 'success');
      },
      error: (err) => this.toastService.mostrar('Error: ' + err.error, 'error')
    });
  }

  rechazarReporte(reporteId: number): void {
    if (!this.resolucionTexto.trim()) {
      this.toastService.mostrar('Debes escribir la resolución antes de confirmar.', 'error');
      return;
    }
    this.http.post(`${this.apiUrl}/admin/reportes/${reporteId}/rechazar?resolucion=${encodeURIComponent(this.resolucionTexto)}`, {}).subscribe({
      next: () => {
        this.reportesPendientes = this.reportesPendientes.filter(r => r.id !== reporteId);
        this.resolucionTexto = '';
        this.reporteSeleccionado = null;
        this.toastService.mostrar('Resolución enviada (reporte rechazado).', 'success');
      },
      error: (err) => this.toastService.mostrar('Error: ' + err.error, 'error')
    });
  }

  // =========================================================================
  // MÉTODOS: Strikes y Apelaciones
  // =========================================================================

  abrirModalStrike(reporte: any) {
    this.reporteParaStrike = reporte;
    this.mostrarModalStrike = true;
    this.motivoStrike = '';
    this.evidenciaStrikeFile = null;
  }

  cerrarModalStrike() {
    this.mostrarModalStrike = false;
    this.reporteParaStrike = null;
  }

  onStrikeFileSelected(event: any) {
    this.evidenciaStrikeFile = event.target.files[0];
  }

  emitirStrike() {
    if (!this.motivoStrike.trim()) {
      this.toastService.mostrar('Debes escribir el motivo del strike.', 'error');
      return;
    }

    if (!this.reporteParaStrike || !this.reporteParaStrike.reserva || !this.reporteParaStrike.reserva.cancha || !this.reporteParaStrike.reserva.cancha.complejo) {
       this.toastService.mostrar('Error: No se puede identificar el complejo.', 'error');
       return;
    }

    this.enviandoStrike = true;

    if (this.evidenciaStrikeFile) {
      const formData = new FormData();
      formData.append('file', this.evidenciaStrikeFile);
      this.http.post<any>(`${this.apiUrl}/api/reportes/upload`, formData).subscribe({
        next: (res) => this.enviarPeticionStrike(res.url),
        error: () => {
          this.toastService.mostrar('Error subiendo evidencia.', 'error');
          this.enviandoStrike = false;
        }
      });
    } else {
      this.enviarPeticionStrike('');
    }
  }

  private enviarPeticionStrike(urlEvidencia: string) {
    const payload = new URLSearchParams();
    payload.set('complejoId', this.reporteParaStrike.reserva.cancha.complejo.id);
    payload.set('reporteId', this.reporteParaStrike.id);
    payload.set('motivoAdmin', this.motivoStrike);
    if (urlEvidencia) {
      payload.set('urlEvidenciaAdmin', urlEvidencia);
    }

    this.http.post(`${this.apiUrl}/api/strikes/admin/emitir`, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe({
      next: () => {
        this.toastService.mostrar('Strike emitido correctamente.', 'success');
        
        // El reporte ya se considera resuelto si se emite strike, llamamos a resolverAFavor (sin validación extra) para actualizar estado si es necesario
        // O simplemente lo removemos de la lista:
        this.reportesPendientes = this.reportesPendientes.filter(r => r.id !== this.reporteParaStrike.id);
        
        this.cerrarModalStrike();
        this.enviandoStrike = false;
      },
      error: (err) => {
        this.toastService.mostrar('Error al emitir strike: ' + err.error, 'error');
        this.enviandoStrike = false;
      }
    });
  }

  cargarApelaciones() {
    this.http.get<any[]>(`${this.apiUrl}/api/strikes/admin/apelaciones`).subscribe({
      next: (data) => this.apelacionesPendientes = data,
      error: (err) => console.error('Error cargando apelaciones:', err)
    });
  }

  resolverApelacion(strikeId: number, estado: string) { // estado: 'MANTENIDO' o 'REVOCADO'
    const payload = new URLSearchParams();
    payload.set('estadoDecision', estado);
    this.http.post(`${this.apiUrl}/api/strikes/admin/${strikeId}/resolver`, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).subscribe({
      next: () => {
        this.toastService.mostrar(`Apelación resuelta: Strike ${estado}`, 'success');
        this.apelacionesPendientes = this.apelacionesPendientes.filter(s => s.id !== strikeId);
      },
      error: (err) => this.toastService.mostrar('Error al resolver apelación: ' + err.error, 'error')
    });
  }

  // =========================================================================
  // MÉTODOS: Recargas de Créditos (Dueño -> Admin)
  // =========================================================================
  cargarRecargasPendientes() {
    this.http.get<any[]>(`${this.apiUrl}/creditos/admin/pendientes`).subscribe({
      next: (res) => this.recargasPendientes = res,
      error: (err) => console.error('Error al cargar recargas:', err)
    });
  }

  abrirModalConfirmacionRecarga(id: number, accion: 'aprobar' | 'rechazar') {
    this.recargaIdSeleccionada = id;
    this.accionConfirmacionRecarga = accion;
    this.mostrarModalConfirmacionRecarga = true;
  }

  cerrarModalConfirmacionRecarga() {
    this.mostrarModalConfirmacionRecarga = false;
    this.recargaIdSeleccionada = null;
    this.accionConfirmacionRecarga = null;
  }

  ejecutarAccionRecarga() {
    if (!this.recargaIdSeleccionada || !this.accionConfirmacionRecarga) return;

    const id = this.recargaIdSeleccionada;
    const accion = this.accionConfirmacionRecarga;
    
    this.http.post(`${this.apiUrl}/creditos/admin/${accion}/${id}`, {}).subscribe({
      next: () => {
        const msj = accion === 'aprobar' ? 'Recarga aprobada exitosamente' : 'Recarga rechazada';
        this.toastService.mostrar(msj, 'success');
        this.cargarRecargasPendientes();
        if (accion === 'aprobar') {
          this.cargarDuenos();
        }
        this.cerrarModalConfirmacionRecarga();
      },
      error: (err) => {
        this.toastService.mostrar(err.error || `Error al ${accion}`, 'error');
        this.cerrarModalConfirmacionRecarga();
      }
    });
  }
}

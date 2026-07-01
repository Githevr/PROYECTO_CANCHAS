import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  resolucionTexto: string = '';

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDuenos();
    this.cargarComplejosPendientes();
    this.cargarReportesPendientes();
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
        alert('✅ Complejo aprobado exitosamente');
      },
      error: (err) => alert('Error: ' + err.error)
    });
  }

  rechazarComplejo(id: number): void {
    this.http.post(`${this.apiUrl}/admin/complejos/${id}/rechazar`, {}).subscribe({
      next: () => {
        this.complejosPendientes = this.complejosPendientes.filter(c => c.id !== id);
        alert('⛔ Complejo rechazado');
      },
      error: (err) => alert('Error: ' + err.error)
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
      alert('Debes escribir la resolución antes de confirmar.');
      return;
    }
    this.http.post(`${this.apiUrl}/admin/reportes/${reporteId}/favor?resolucion=${encodeURIComponent(this.resolucionTexto)}`, {}).subscribe({
      next: () => {
        this.reportesPendientes = this.reportesPendientes.filter(r => r.id !== reporteId);
        this.resolucionTexto = '';
        alert('✅ Reporte resuelto A FAVOR del jugador. Dueño penalizado.');
      },
      error: (err) => alert('Error: ' + err.error)
    });
  }

  resolverRechazado(reporteId: number): void {
    if (!this.resolucionTexto.trim()) {
      alert('Debes escribir la resolución antes de confirmar.');
      return;
    }
    this.http.post(`${this.apiUrl}/admin/reportes/${reporteId}/rechazar?resolucion=${encodeURIComponent(this.resolucionTexto)}`, {}).subscribe({
      next: () => {
        this.reportesPendientes = this.reportesPendientes.filter(r => r.id !== reporteId);
        this.resolucionTexto = '';
        alert('⛔ Reporte rechazado. Sin penalización al dueño.');
      },
      error: (err) => alert('Error: ' + err.error)
    });
  }
}

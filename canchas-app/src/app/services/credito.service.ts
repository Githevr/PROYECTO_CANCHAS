import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditoService {

  private apiUrl = 'http://localhost:8080/creditos';

  constructor(private http: HttpClient) {}

  // Registrar una solicitud de recarga de créditos
  solicitarRecarga(request: {
    propietarioId: number;
    monto: number;
    metodoPago: string;
    nroOperacion: string;
    imagenComprobante: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar`, request);
  }

  // Calcular créditos dinámicamente según el monto y promociones (simulación en tiempo real)
  calcularPromo(monto: number, propietarioId: number): Observable<any> {
    const params = new HttpParams()
      .set('monto', String(monto))
      .set('propietarioId', String(propietarioId));
    return this.http.get(`${this.apiUrl}/calcular-promo`, { params });
  }

  // Obtener el historial de movimientos de crédito
  obtenerHistorial(propietarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/${propietarioId}`);
  }

  // Obtener el historial de solicitudes de recarga
  obtenerRecargas(propietarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recargas/${propietarioId}`);
  }

  // Verificar si es la primera recarga del propietario
  esPrimeraRecarga(propietarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/es-primera/${propietarioId}`);
  }
}

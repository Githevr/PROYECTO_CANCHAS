import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CanchaLocal {
  id: number;
  nombre: string;
  ubicacion: string;
  precio: number;
  imagen: string;
  imagenes?: string[]; // Múltiples imágenes de la cancha
  rating: number;
  tipo: string;
  complejo?: any; // Vinculación opcional al complejo deportivo
}

export interface HorarioDTO {
  hora: string;
  estado: string;
  segundosRestantes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private apiUrl = 'http://localhost:8080/reservas';

  constructor(private http: HttpClient) {}

  getCanchas(): Observable<CanchaLocal[]> {
    return this.http.get<CanchaLocal[]>('http://localhost:8080/canchas');
  }

  getCanchasPaginado(page: number, size: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/canchas/paginado?page=${page}&size=${size}`);
  }

  getHorariosDisponibles(canchaId: number, fecha: string): Observable<HorarioDTO[]> {
    return this.http.get<HorarioDTO[]>(`${this.apiUrl}/disponibilidad/${canchaId}?fecha=${fecha}`);
  }

  getReservasPorUsuario(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  getReservasPorPropietario(propietarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/propietario/${propietarioId}`);
  }

  registrarReserva(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getReserva(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Confirmar que se recibió el 50% de garantía (Dueño)
  confirmarReserva(reservaId: number, propietarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reservaId}/confirmar?propietarioId=${propietarioId}`, {});
  }

  // Finalizar el pago al 100% al llegar al local (Dueño)
  finalizarReserva(reservaId: number, propietarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reservaId}/finalizar?propietarioId=${propietarioId}`, {});
  }

  // Liberar reserva por inasistencia (Dueño)
  liberarReserva(reservaId: number, propietarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reservaId}/liberar?propietarioId=${propietarioId}`, {});
  }

  // Cancelar reserva voluntariamente (Jugador)
  cancelarReserva(reservaId: number, clienteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservaId}/cancelar?clienteId=${clienteId}`, { responseType: 'text' });
  }

  // Calificaciones
  getReservaPendienteCalificar(clienteId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/calificaciones/pendiente/${clienteId}`);
  }

  guardarCalificacion(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/calificaciones', data);
  }
}
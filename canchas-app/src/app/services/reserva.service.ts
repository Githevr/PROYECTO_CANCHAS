import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CanchaLocal {

  id: number;
  nombre: string;
  ubicacion: string;
  precio: number;
  imagen: string;
  rating: number;
  tipo: string;

}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private apiUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient
  ) {}

  getCanchas(): Observable<CanchaLocal[]> {

    return this.http.get<CanchaLocal[]>(
      `${this.apiUrl}/canchas`
    );

  }

  getHorariosDisponibles(
    canchaId: number,
    fecha: string
  ): Observable<string[]> {

    return this.http.get<string[]>(
      `${this.apiUrl}/reservas/disponibilidad/${canchaId}?fecha=${fecha}`
    );

  }
  getReservasPorUsuario(clienteId: number) {

  return this.http.get<any[]>(
    `${this.apiUrl}/reservas/cliente/${clienteId}`
  );

}

  registrarReserva(data: any): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/reservas`,
      data
    );

  }
  getReserva(id: number) {

  return this.http.get<any>(
    `${this.apiUrl}/reservas/${id}`
  );

}

}
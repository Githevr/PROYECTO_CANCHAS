import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Cancha } from '../model/cancha.model';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private url = 'http://localhost:8080';

  constructor(
    private http: HttpClient
  ) {}

  getCanchas(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(
      `${this.url}/canchas`
    );
  }

  // Paginación: trae canchas activas con límite por página
  getCanchasPaginado(page: number, size: number): Observable<any> {
    return this.http.get<any>(
      `${this.url}/canchas/paginado?page=${page}&size=${size}`
    );
  }

  // Top Rated: trae las canchas mejor puntuadas para el carrusel
  getTopRatedCanchas(limit: number = 10): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(
      `${this.url}/canchas/top-rated?limit=${limit}`
    );
  }

  crearReserva(data: any) {
    return this.http.post(
      `${this.url}/reservas`,
      data
    );
  }

}
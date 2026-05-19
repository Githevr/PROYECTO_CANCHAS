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
  crearReserva(data: any) {

    return this.http.post(
      `${this.url}/reservas`,
      data
    );

  }

}
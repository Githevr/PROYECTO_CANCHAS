import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/clientes';

  constructor(
    private http: HttpClient
  ) {}

  login(
    correo: string,
    password: string
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/login`,
      {
        correo,
        password
      }
    );
  }

  registrar(usuario: any): Observable<any> {

    return this.http.post(
      this.apiUrl,
      usuario
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem('cliente');
  }

  obtenerUsuarioActual(): any {

    const usuario =
      localStorage.getItem('cliente');

    return usuario
      ? JSON.parse(usuario)
      : null;
  }

  estaLogueado(): boolean {
    return localStorage.getItem('cliente') !== null;
  }
}
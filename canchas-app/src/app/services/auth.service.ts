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

  confirmarCorreo(correo: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/confirmar`,
      {
        correo,
        codigo
      }
    );
  }

  obtenerDatosCliente(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  reenviarCodigo(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reenviar-codigo?correo=${encodeURIComponent(correo)}`, {});
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

  obtenerRol(): string | null {
    const usuario = this.obtenerUsuarioActual();
    return usuario ? usuario.rol : null;
  }

  obtenerCreditos(): number {
    const usuario = this.obtenerUsuarioActual();
    return usuario && usuario.creditos ? Number(usuario.creditos) : 0.00;
  }

  actualizarCreditos(nuevosCreditos: number): void {
    const usuario = this.obtenerUsuarioActual();
    if (usuario) {
      usuario.creditos = nuevosCreditos;
      localStorage.setItem('cliente', JSON.stringify(usuario));
    }
  }
}
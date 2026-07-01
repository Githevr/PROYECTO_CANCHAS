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

  // Obtiene el token JWT real
  obtenerToken(): string | null {
    const usuarioStr = localStorage.getItem('cliente');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      return usuario.token || null;
    }
    return null;
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  // Mantenido por compatibilidad si es llamado en otros lugares como estaLogueado
  estaLogueado(): boolean {
    return this.estaAutenticado();
  }

  obtenerUsuario(): any | null {
    const usuario = localStorage.getItem('cliente');
    return usuario ? JSON.parse(usuario) : null;
  }

  // Mantenido por compatibilidad
  obtenerUsuarioActual(): any {
    return this.obtenerUsuario();
  }

  // Obtiene el rol autenticado para que el roleGuard pueda autorizar rutas.
  obtenerRol(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario?.rol ? usuario.rol.toUpperCase() : null;
  }

  logout(): void {
    localStorage.removeItem('cliente');
  }

  // Mantenido por compatibilidad
  cerrarSesion(): void {
    this.logout();
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
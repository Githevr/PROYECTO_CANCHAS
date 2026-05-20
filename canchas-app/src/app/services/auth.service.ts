import { Injectable } from '@angular/core';

import { Usuario } from '../model/usuario.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private usuarios: Usuario[] = [];

  private usuarioActual: Usuario | null = null;

  registrar(usuario: Usuario): boolean {

    const existe = this.usuarios.find(
      u => u.email === usuario.email
    );

    if (existe) {
      return false;
    }

    this.usuarios.push(usuario);
    return true;

  }

  iniciarSesion(email: string, password: string): boolean {

    const usuario = this.usuarios.find(
      u => u.email === email && u.password === password
    );

    if (usuario) {
      this.usuarioActual = usuario;
      return true;
    }

    return false;

  }

  cerrarSesion(): void {
    this.usuarioActual = null;
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  estaLogueado(): boolean {
    return this.usuarioActual !== null;
  }

}

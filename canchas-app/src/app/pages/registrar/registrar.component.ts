import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registrar',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent
  ],

  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.css'
})

export class RegistrarComponent {

  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';

  mensaje: string = '';
  tipoMensaje: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar() {

    if (!this.nombre || !this.email || !this.password || !this.confirmarPassword) {
      this.mensaje = 'Por favor, completa todos los campos.';
      this.tipoMensaje = 'error';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      this.tipoMensaje = 'error';
      return;
    }

    if (this.password.length < 6) {
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      this.tipoMensaje = 'error';
      return;
    }

    const resultado = this.authService.registrar({
      nombre: this.nombre,
      email: this.email,
      password: this.password
    });

    if (resultado) {
      this.mensaje = '¡Registro exitoso! Redirigiendo al login...';
      this.tipoMensaje = 'exito';

      setTimeout(() => {
        this.router.navigate(['/iniciarsesion']);
      }, 1500);

    } else {
      this.mensaje = 'Ya existe una cuenta con ese correo electrónico.';
      this.tipoMensaje = 'error';
    }

  }

}

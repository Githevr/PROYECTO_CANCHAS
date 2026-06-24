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

      this.mensaje =
        'Por favor, completa todos los campos.';

      this.tipoMensaje = 'error';
      return;
    }

    if (this.password !== this.confirmarPassword) {

      this.mensaje =
        'Las contraseñas no coinciden.';

      this.tipoMensaje = 'error';
      return;
    }

    if (this.password.length < 6) {

      this.mensaje =
        'La contraseña debe tener al menos 6 caracteres.';

      this.tipoMensaje = 'error';
      return;
    }

    const cliente = {
      nombre: this.nombre,
      apellido: '',
      telefono: '',
      correo: this.email,
      password: this.password
    };

    this.authService.registrar(cliente)
      .subscribe({

        next: () => {

          this.mensaje =
            '¡Registro exitoso! Redirigiendo al login...';

          this.tipoMensaje = 'exito';

          setTimeout(() => {
            this.router.navigate(['/iniciarsesion']);
          }, 1500);
        },

        error: (error) => {

          console.error(error);

          this.mensaje =
            'No se pudo registrar el usuario.';

          this.tipoMensaje = 'error';
        }
      });
  }
}
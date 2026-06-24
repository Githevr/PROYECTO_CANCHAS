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

  rol: string = 'JUGADOR';

  mensaje: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;

  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleMostrarConfirmarPassword() {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }

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
      password: this.password,
      rol: this.rol
    };

    this.cargando = true;
    this.mensaje = 'Creando cuenta y enviando correo de confirmación...';
    this.tipoMensaje = 'exito';

    this.authService.registrar(cliente)
      .subscribe({

        next: () => {
          this.cargando = false;
          this.mensaje =
            '¡Registro exitoso! Redirigiendo a confirmación de correo...';

          this.tipoMensaje = 'exito';

          setTimeout(() => {
            this.router.navigate(['/confirmar-correo'], { queryParams: { email: this.email } });
          }, 1500);
        },

        error: (error) => {
          this.cargando = false;
          console.error(error);

          this.mensaje = error.error?.message || 'No se pudo registrar el usuario. Verifica tu conexión o si el correo ya existe.';

          this.tipoMensaje = 'error';
        }
      });
  }
}
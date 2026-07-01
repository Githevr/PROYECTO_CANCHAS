import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-iniciarsesion',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent
  ],

  templateUrl: './iniciarsesion.component.html',
  styleUrl: './iniciarsesion.component.css'
})
export class IniciarsesionComponent {

  email: string = '';
  password: string = '';

  mensaje: string = '';
  tipoMensaje: string = '';
  requiereConfirmacion: boolean = false;
  mostrarPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion() {
    this.requiereConfirmacion = false;

    if (!this.email || !this.password) {

      this.mensaje =
        'Por favor, completa todos los campos.';

      this.tipoMensaje = 'error';
      return;
    }

    this.authService.login(
      this.email,
      this.password
    ).subscribe({

      next: (response) => {

        localStorage.setItem(
          'cliente',
          JSON.stringify(response)
        );

        this.mensaje =
          '¡Bienvenido de vuelta!';

        this.tipoMensaje = 'exito';

        setTimeout(() => {
          if (response.rol === 'PROPIETARIO') {
            this.router.navigate(['/propietario/dashboard']);
          } else if (response.rol === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1000);
      },

      error: (error) => {

        console.error(error);

        const errorMsg = error.error?.message || 'Correo o contraseña incorrectos.';
        this.mensaje = errorMsg;
        this.tipoMensaje = 'error';

        if (errorMsg.includes('confirmar su correo')) {
          this.requiereConfirmacion = true;
        }
      }
    });
  }

  irAConfirmacion() {
    this.router.navigate(['/confirmar-correo'], { queryParams: { email: this.email } });
  }

}
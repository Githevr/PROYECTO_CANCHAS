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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion() {

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
          this.router.navigate(['/']);
        }, 1000);
      },

      error: (error) => {

        console.error(error);

        this.mensaje =
          'Correo o contraseña incorrectos.';

        this.tipoMensaje = 'error';
      }
    });
  }

}
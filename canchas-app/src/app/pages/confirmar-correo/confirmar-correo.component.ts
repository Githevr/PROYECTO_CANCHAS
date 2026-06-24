import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirmar-correo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './confirmar-correo.component.html',
  styleUrl: './confirmar-correo.component.css'
})
export class ConfirmarCorreoComponent implements OnInit {

  email: string = '';
  codigo: string = '';

  mensaje: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  confirmar() {
    if (!this.email) {
      this.mensaje = 'No se ha especificado un correo electrónico válido.';
      this.tipoMensaje = 'error';
      return;
    }

    if (!this.codigo || this.codigo.length !== 6) {
      this.mensaje = 'Por favor, ingresa el código de 6 dígitos.';
      this.tipoMensaje = 'error';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    this.authService.confirmarCorreo(this.email, this.codigo).subscribe({
      next: (response) => {
        this.cargando = false;
        this.mensaje = response.mensaje || '¡Correo confirmado exitosamente! Redirigiendo al login...';
        this.tipoMensaje = 'exito';

        setTimeout(() => {
          this.router.navigate(['/iniciarsesion']);
        }, 2000);
      },
      error: (error) => {
        this.cargando = false;
        console.error(error);
        this.mensaje = error.error?.message || 'Código de confirmación incorrecto.';
        this.tipoMensaje = 'error';
      }
    });
  }
}

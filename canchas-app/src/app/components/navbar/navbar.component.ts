import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si el usuario está autenticado, refrescar su saldo de créditos real desde la base de datos
    if (this.authService.estaLogueado()) {
      const usuario = this.authService.obtenerUsuarioActual();
      if (usuario) {
        this.authService.obtenerDatosCliente(usuario.id).subscribe({
          next: (res) => {
            if (res && res.creditos !== undefined) {
              // Sincronizar el saldo local de la UI con la base de datos
              this.authService.actualizarCreditos(res.creditos);
            }
          },
          error: (err) => {
            console.error('Error al sincronizar créditos con el servidor:', err);
          }
        });
      }
    }
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/iniciarsesion']);
  }

}

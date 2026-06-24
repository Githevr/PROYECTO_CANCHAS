import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesRequeridos = route.data['roles'] as Array<string>;
  const rolUsuario = authService.obtenerRol();

  if (authService.estaLogueado() && rolesRequeridos && rolesRequeridos.includes(rolUsuario || '')) {
    return true;
  }

  // Redirigir al inicio si el rol no tiene permisos para esta ruta
  console.warn('Acceso denegado a la ruta: ' + state.url + '. Rol de usuario: ' + rolUsuario);
  router.navigate(['/']);
  return false;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Este guard valida si el usuario inició sesión.
// Si no hay token, se redirige al login.
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  // Retornar UrlTree en lugar de router.navigate + return false
  return router.createUrlTree(['/iniciarsesion'], { queryParams: { returnUrl: state.url } });
};

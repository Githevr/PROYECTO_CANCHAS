import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Este guard valida autorización por rol.
// Evita que un jugador entre a rutas de propietario y viceversa.
// Los roles permitidos se configuran en app.routes.ts con data.roles.
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/iniciarsesion'], { queryParams: { returnUrl: state.url } });
  }

  const rolesPermitidos = route.data['roles'] as string[];
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true; // Si no hay roles configurados, se asume que es accesible para cualquier rol
  }

  const rolActual = authService.obtenerRol();
  if (rolActual && rolesPermitidos.map(r => r.toUpperCase()).includes(rolActual)) {
    return true; // El rol coincide, permitir acceso
  }

  console.warn(`Acceso denegado a la ruta: ${state.url}. Rol actual: ${rolActual}. Se requiere: ${rolesPermitidos.join(', ')}`);
  return router.createUrlTree(['/no-autorizado']);
};

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastState {
  mensaje: string;
  tipo: 'success' | 'error';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private estado = new BehaviorSubject<ToastState>({ mensaje: '', tipo: 'success', visible: false });
  estado$ = this.estado.asObservable();

  private timeout: any;

  mostrar(mensaje: string, tipo: 'success' | 'error' = 'success', duracion: number = 3000): void {
    // Limpiar timeout anterior si existe
    if (this.timeout) clearTimeout(this.timeout);

    this.estado.next({ mensaje, tipo, visible: true });

    this.timeout = setTimeout(() => {
      this.ocultar();
    }, duracion);
  }

  ocultar(): void {
    this.estado.next({ mensaje: '', tipo: 'success', visible: false });
  }
}

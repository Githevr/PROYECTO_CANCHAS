import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastState } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html'
})
export class ToastComponent implements OnDestroy {

  toast: ToastState = { mensaje: '', tipo: 'success', visible: false };
  private sub: Subscription;

  constructor(private toastService: ToastService) {
    this.sub = this.toastService.estado$.subscribe(estado => {
      this.toast = estado;
    });
  }

  cerrar(): void {
    this.toastService.ocultar();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

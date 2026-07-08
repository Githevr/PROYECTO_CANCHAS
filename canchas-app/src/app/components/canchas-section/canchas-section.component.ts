import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Cancha } from '../../model/cancha.model';

@Component({
  selector: 'app-canchas-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './canchas-section.component.html',
  styleUrls: ['./canchas-section.component.css']
})
export class CanchasSectionComponent implements OnInit {

  canchas: Cancha[] = [];
  currentSlide: number = 0;
  itemsPerView: number = 4;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Solo traemos las top rated (máximo 10) para el carrusel del inicio
    this.apiService.getTopRatedCanchas(10).subscribe((data) => {
      this.canchas = data;
    });

    this.updateItemsPerView();
    window.addEventListener('resize', () => this.updateItemsPerView());
  }

  obtenerImagenUrl(imagen: string): string {
    if (!imagen) return '/images/cancha_placeholder.jpg';
    if (imagen.startsWith('/uploads/')) {
      return 'http://localhost:8080' + imagen;
    }
    return imagen;
  }

  // Controles del carrusel
  updateItemsPerView(): void {
    const width = window.innerWidth;
    if (width < 640) this.itemsPerView = 1;
    else if (width < 992) this.itemsPerView = 2;
    else if (width < 1400) this.itemsPerView = 3;
    else this.itemsPerView = 4;

    // Ajustar slide si se excede al cambiar tamaño
    if (this.currentSlide > this.maxSlide) {
      this.currentSlide = this.maxSlide;
    }
  }

  get maxSlide(): number {
    return Math.max(0, this.canchas.length - this.itemsPerView);
  }

  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  nextSlide(): void {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
    }
  }

  get translateX(): string {
    const cardWidthPercent = 100 / this.itemsPerView;
    return `translateX(-${this.currentSlide * cardWidthPercent}%)`;
  }
}
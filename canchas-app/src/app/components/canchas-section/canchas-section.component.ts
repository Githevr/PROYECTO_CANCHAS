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

export class CanchasSectionComponent
implements OnInit {

  canchas: Cancha[] = [];

  constructor(
    private apiService: ApiService
  ) {}

  ngOnInit(): void {

    this.apiService
      .getCanchas()
      .subscribe((data) => {

        this.canchas = data;

      });

  }

  obtenerImagenUrl(imagen: string): string {
    if (!imagen) return '/images/cancha_placeholder.jpg';
    if (imagen.startsWith('/uploads/')) {
      return 'http://localhost:8080' + imagen;
    }
    return imagen;
  }
}
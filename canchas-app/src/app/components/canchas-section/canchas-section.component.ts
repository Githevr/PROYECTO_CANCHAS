import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ApiService } from '../../services/api.service';

import { Cancha } from '../../model/cancha.model';

@Component({
  selector: 'app-canchas-section',

  standalone: true,

  imports: [CommonModule],

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

}
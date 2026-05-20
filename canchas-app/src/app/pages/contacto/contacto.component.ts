import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-contacto',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent
  ],

  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})

export class ContactoComponent {

}

import { Component } from '@angular/core';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { CanchasSectionComponent } from '../../components/canchas-section/canchas-section.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    NavbarComponent,
    HeroComponent,
    CanchasSectionComponent,
    FooterComponent
  ],

  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {}
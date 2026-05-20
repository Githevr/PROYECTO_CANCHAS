import { Injectable } from '@angular/core';

import { Reserva } from '../model/reserva.model';

export interface CanchaLocal {

  id: number;

  nombre: string;

  ubicacion: string;

  precio: number;

  imagen: string;

  rating: number;

  tipo: string;

  horariosDisponibles: string[];

}

@Injectable({
  providedIn: 'root'
})

export class ReservaService {

  private reservas: Reserva[] = [];

  private contadorId: number = 1;

  // Datos en duro de las canchas
  private canchas: CanchaLocal[] = [
    {
      id: 1,
      nombre: 'Cancha Principal - Fútbol',
      ubicacion: 'Av. España 1234, Trujillo',
      precio: 80,
      imagen: '/images/cancha1.jpg',
      rating: 4.8,
      tipo: 'Fútbol',
      horariosDisponibles: [
        '08:00', '09:00', '10:00', '11:00',
        '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
      ]
    },
    {
      id: 2,
      nombre: 'Cancha Élite - Voley',
      ubicacion: 'Jr. Pizarro 567, Trujillo',
      precio: 60,
      imagen: '/images/cancha2.jpg',
      rating: 4.5,
      tipo: 'Voley',
      horariosDisponibles: [
        '08:00', '09:00', '10:00', '11:00',
        '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
      ]
    },
    {
      id: 3,
      nombre: 'Cancha Pro - Básquet',
      ubicacion: 'Av. Larco 890, Trujillo',
      precio: 70,
      imagen: '/images/cancha3.jpg',
      rating: 4.6,
      tipo: 'Básquet',
      horariosDisponibles: [
        '08:00', '09:00', '10:00', '11:00',
        '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
      ]
    }
  ];

  getCanchas(): CanchaLocal[] {
    return this.canchas;
  }

  getHorariosDisponibles(canchaId: number, fecha: string): string[] {

    const cancha = this.canchas.find(c => c.id === canchaId);

    if (!cancha) return [];

    // Filtrar horarios ya reservados para esa cancha y fecha
    const horariosOcupados = this.reservas
      .filter(r => r.canchaId === canchaId && r.fecha === fecha)
      .map(r => r.hora);

    return cancha.horariosDisponibles.filter(
      h => !horariosOcupados.includes(h)
    );

  }

  estaOcupado(canchaId: number, fecha: string, hora: string): boolean {

    return this.reservas.some(
      r => r.canchaId === canchaId && r.fecha === fecha && r.hora === hora
    );

  }

  registrarReserva(reserva: Omit<Reserva, 'id' | 'estado'>): Reserva {

    const nuevaReserva: Reserva = {
      ...reserva,
      id: this.contadorId++,
      estado: 'confirmado'
    };

    this.reservas.push(nuevaReserva);
    return nuevaReserva;

  }

  getReservasPorUsuario(email: string): Reserva[] {

    return this.reservas.filter(r => r.usuarioEmail === email);

  }

  getTodasLasReservas(): Reserva[] {
    return this.reservas;
  }

}

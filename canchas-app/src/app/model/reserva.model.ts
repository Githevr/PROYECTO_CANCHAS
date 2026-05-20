export interface Reserva {

  id: number;

  canchaId: number;

  canchaName: string;

  canchaImagen: string;

  fecha: string;

  hora: string;

  precio: number;

  usuarioEmail: string;

  estado: 'pendiente' | 'confirmado';

}

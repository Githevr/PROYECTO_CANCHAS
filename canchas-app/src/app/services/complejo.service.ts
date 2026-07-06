import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplejoService {

  private apiUrl = 'http://localhost:8080/complejos';

  constructor(private http: HttpClient) {}

  // Registrar un nuevo complejo deportivo
  crearComplejo(complejo: any, propietarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}?propietarioId=${propietarioId}`, complejo);
  }

  // Agregar una cancha a un complejo específico
  agregarCancha(complejoId: number, cancha: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${complejoId}/canchas`, cancha);
  }

  // Actualizar documentos KYB de un complejo rechazado
  actualizarKybComplejo(complejoId: number, datosActualizados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${complejoId}/kyb`, datosActualizados);
  }

  // Listar los complejos deportivos de un propietario
  obtenerComplejosPropietario(propietarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/propietario/${propietarioId}`);
  }

  // Buscar complejos por ciudad (Buscador del Jugador)
  buscarComplejos(ciudad: string, soloActivos: boolean = true): Observable<any> {
    const params = new HttpParams()
      .set('ciudad', ciudad)
      .set('soloActivos', String(soloActivos));
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  // Obtener detalles de un complejo por ID
  obtenerComplejo(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Obtener las canchas de un complejo
  obtenerCanchasComplejo(complejoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${complejoId}/canchas`);
  }

  // Subir una imagen al servidor
  subirImagenCancha(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://localhost:8080/api/canchas/upload', formData);
  }

  // Eliminar una imagen del servidor
  eliminarImagenCancha(url: string): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/canchas/upload?url=${encodeURIComponent(url)}`);
  }

  // Subir un documento KYB al servidor
  subirDocumentoKyb(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://localhost:8080/api/kyb/upload', formData);
  }

  // Eliminar un documento KYB del servidor
  eliminarDocumentoKyb(url: string): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/kyb/upload?url=${encodeURIComponent(url)}`);
  }
}

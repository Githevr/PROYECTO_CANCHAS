import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { ComplejoService } from '../../../services/complejo.service';

@Component({
  selector: 'app-mis-complejos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './mis-complejos.component.html',
  styleUrl: './mis-complejos.component.css'
})
export class MisComplejosComponent implements OnInit {

  propietarioId!: number;
  complejos: any[] = [];
  canchasPorComplejo: { [complejoId: number]: any[] } = {};

  // Formulario de Complejo
  mostrarFormComplejo: boolean = false;
  nuevoComplejo: any = {
    nombre: '',
    direccion: '',
    ciudad: 'Trujillo',
    telefonoContacto: '',
    yapePlinInfo: '',
    descripcion: '',
    imagenPrincipal: ''
  };

  // Checkboxes de Beneficios
  comodidades = [
    { name: 'Duchas', selected: false },
    { name: 'Estacionamiento', selected: false },
    { name: 'Cafetería', selected: false },
    { name: 'Wifi', selected: false },
    { name: 'Vestuarios', selected: false },
    { name: 'Luz Nocturna', selected: false }
  ];

  // Formulario de Cancha
  complejoSeleccionadoParaCancha: number | null = null;
  nuevaCancha: any = {
    nombre: '',
    precio: 80.00,
    tipo: 'Fútbol',
    imagen: '',
    imagenes: []
  };
  imagenesCargadas: string[] = [];
  subiendoImagen: boolean = false;

  // Feedback
  mensaje: string = '';
  tipoMensaje: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private complejoService: ComplejoService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (usuario) {
      this.propietarioId = usuario.id;
      this.cargarComplejos();
    }
  }

  cargarComplejos(): void {
    this.complejoService.obtenerComplejosPropietario(this.propietarioId).subscribe({
      next: (res) => {
        this.complejos = res;
        // Cargar canchas para cada complejo de forma asíncrona
        this.complejos.forEach(c => this.cargarCanchasComplejo(c.id));
      },
      error: (err) => console.error('Error al cargar complejos:', err)
    });
  }

  cargarCanchasComplejo(complejoId: number): void {
    this.complejoService.obtenerCanchasComplejo(complejoId).subscribe({
      next: (res) => {
        this.canchasPorComplejo[complejoId] = res;
      },
      error: (err) => console.error(`Error al cargar canchas del complejo ${complejoId}:`, err)
    });
  }

  toggleFormComplejo(): void {
    this.mostrarFormComplejo = !this.mostrarFormComplejo;
    this.mensaje = '';
  }

  registrarComplejo(): void {
    if (!this.nuevoComplejo.nombre || !this.nuevoComplejo.direccion || !this.nuevoComplejo.telefonoContacto || !this.nuevoComplejo.yapePlinInfo) {
      this.mensaje = 'Por favor, rellene los campos obligatorios.';
      this.tipoMensaje = 'error';
      return;
    }

    this.cargando = true;
    
    // Unir los beneficios seleccionados por comas
    const beneficiosSeleccionados = this.comodidades
      .filter(c => c.selected)
      .map(c => c.name)
      .join(', ');
    
    const complejoData = {
      ...this.nuevoComplejo,
      beneficios: beneficiosSeleccionados,
      imagenPrincipal: this.nuevoComplejo.imagenPrincipal || '/images/complejo_placeholder.jpg'
    };

    this.complejoService.crearComplejo(complejoData, this.propietarioId).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = '¡Complejo deportivo registrado con éxito!';
        this.tipoMensaje = 'exito';
        this.mostrarFormComplejo = false;
        
        // Resetear formulario
        this.nuevoComplejo = {
          nombre: '',
          direccion: '',
          ciudad: 'Trujillo',
          telefonoContacto: '',
          yapePlinInfo: '',
          descripcion: '',
          imagenPrincipal: ''
        };
        this.comodidades.forEach(c => c.selected = false);

        this.cargarComplejos();
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = err.error || 'No se pudo registrar el complejo.';
        this.tipoMensaje = 'error';
      }
    });
  }

  abrirFormCancha(complejoId: number): void {
    this.complejoSeleccionadoParaCancha = complejoId;
    this.mensaje = '';
  }

  cerrarFormCancha(): void {
    // Si cancela, eliminar las imágenes que ya había subido temporalmente en esta sesión para no dejar basura en el servidor
    if (this.imagenesCargadas.length > 0) {
      this.imagenesCargadas.forEach(url => {
        this.complejoService.eliminarImagenCancha(url).subscribe({
          error: (err) => console.error('Error al limpiar imagen huérfana:', err)
        });
      });
    }
    this.imagenesCargadas = [];
    this.complejoSeleccionadoParaCancha = null;
    this.mensaje = '';
  }

  onArchivoSeleccionado(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Validar límite máximo de 3 fotos
    if (this.imagenesCargadas.length >= 3) {
      this.mensaje = 'Únicamente se permite subir un máximo de 3 fotos por cancha.';
      this.tipoMensaje = 'error';
      return;
    }

    const file = files[0];
    
    // Validar tipo de contenido (sólo imágenes)
    if (!file.type.startsWith('image/')) {
      this.mensaje = 'El archivo seleccionado debe ser una imagen válida.';
      this.tipoMensaje = 'error';
      return;
    }

    // Validar tamaño máximo de 2MB
    if (file.size > 2 * 1024 * 1024) {
      this.mensaje = 'La imagen es muy pesada. El tamaño máximo permitido es 2MB.';
      this.tipoMensaje = 'error';
      return;
    }

    this.subiendoImagen = true;
    this.mensaje = 'Subiendo imagen al servidor...';
    this.tipoMensaje = 'info';

    this.complejoService.subirImagenCancha(file).subscribe({
      next: (res) => {
        this.subiendoImagen = false;
        this.imagenesCargadas.push(res.url);
        this.mensaje = 'Foto cargada correctamente.';
        this.tipoMensaje = 'exito';
      },
      error: (err) => {
        this.subiendoImagen = false;
        this.mensaje = err.error || 'Error al subir la foto al servidor.';
        this.tipoMensaje = 'error';
      }
    });
  }

  eliminarImagenDeLista(index: number): void {
    const url = this.imagenesCargadas[index];
    this.subiendoImagen = true;
    this.mensaje = 'Eliminando imagen...';
    this.tipoMensaje = 'info';

    this.complejoService.eliminarImagenCancha(url).subscribe({
      next: () => {
        this.subiendoImagen = false;
        this.imagenesCargadas.splice(index, 1);
        this.mensaje = 'Foto eliminada con éxito.';
        this.tipoMensaje = 'exito';
      },
      error: (err) => {
        this.subiendoImagen = false;
        // En caso de que no se encuentre en el servidor (404), la removemos igualmente de la lista local
        this.imagenesCargadas.splice(index, 1);
        this.mensaje = 'Foto removida del formulario.';
        this.tipoMensaje = 'exito';
      }
    });
  }

  registrarCancha(): void {
    if (!this.nuevaCancha.nombre || !this.nuevaCancha.precio) {
      this.mensaje = 'Por favor, complete los datos de la cancha.';
      this.tipoMensaje = 'error';
      return;
    }

    // Validar mínimo de 1 imagen
    if (this.imagenesCargadas.length === 0) {
      this.mensaje = 'Debes subir al menos 1 foto para la cancha deportiva (máximo 3).';
      this.tipoMensaje = 'error';
      return;
    }

    if (this.complejoSeleccionadoParaCancha === null) return;

    this.cargando = true;

    // Asignar el listado de imágenes cargadas y definir la primera como la principal
    this.nuevaCancha.imagenes = [...this.imagenesCargadas];
    this.nuevaCancha.imagen = this.imagenesCargadas[0];

    this.complejoService.agregarCancha(this.complejoSeleccionadoParaCancha, this.nuevaCancha).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = '¡Cancha agregada exitosamente al complejo!';
        this.tipoMensaje = 'exito';
        
        const compId = this.complejoSeleccionadoParaCancha!;
        this.complejoSeleccionadoParaCancha = null;

        // Resetear campos de cancha
        this.nuevaCancha = {
          nombre: '',
          precio: 80.00,
          tipo: 'Fútbol',
          imagen: '',
          imagenes: []
        };
        this.imagenesCargadas = [];

        this.cargarCanchasComplejo(compId);
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = err.error || 'No se pudo agregar la cancha.';
        this.tipoMensaje = 'error';
      }
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

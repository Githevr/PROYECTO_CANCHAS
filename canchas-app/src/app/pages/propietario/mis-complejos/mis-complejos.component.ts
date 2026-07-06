import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { ComplejoService } from '../../../services/complejo.service';
import { ToastService } from '../../../services/toast.service';

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
  mostrarConfirmacionCancelarComplejo: boolean = false;
  mostrarModalKyb: boolean = false;
  cargandoDocumentoKyb: boolean = false;
  mostrarRechazoKyb: boolean = false;
  
  // Corrección KYB
  mostrarModalCorrecionKyb: boolean = false;
  complejoCorrecionKyb: any = null;
  
  nuevoComplejo: any = {
    nombre: '',
    direccion: '',
    ciudad: 'Trujillo',
    telefonoContacto: '',
    yapePlinInfo: '',
    descripcion: '',
    imagenPrincipal: '',
    tipoCobro: 'billetera',
    bancoInfo: '',
    billeteraTipo: '1',
    billeteraNumero: '',
    ruc: '',
    razonSocial: '',
    urlLicencia: '',
    urlFichaRuc: '',
    urlDniRepresentante: '',
    urlDniReverso: ''
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
    public authService: AuthService,
    private complejoService: ComplejoService,
    private toastService: ToastService
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
        this.complejos.forEach(c => {
          this.cargarCanchasComplejo(c.id);
          // Si algún complejo fue rechazado, mostrar el modal de aviso temporal
          if (c.estadoVerificacion === 'REJECTED') {
            this.mostrarRechazoKyb = true;
            setTimeout(() => {
              this.mostrarRechazoKyb = false;
            }, 15000);
          }
          // Si fue aprobado y no hemos mostrado el mensaje en esta sesión
          if (c.estadoVerificacion === 'VERIFIED' && !sessionStorage.getItem('felicidades_kyb_' + c.id)) {
            sessionStorage.setItem('felicidades_kyb_' + c.id, 'true');
            this.toastService.mostrar('¡Felicidades! Tus documentos han sido aprobados. 🎉', 'success');
          }
        });
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
    if (!this.mostrarFormComplejo && !this.mostrarModalKyb) {
      this.mostrarModalKyb = true; // Abrir modal KYB primero
    } else {
      this.mostrarFormComplejo = false;
      this.mostrarModalKyb = false;
    }
    this.mensaje = '';
    this.mostrarConfirmacionCancelarComplejo = false;
  }

  cancelarKyb(): void {
    this.mostrarModalKyb = false;
    this.mensaje = '';
  }

  continuarRegistroKyb(): void {
    if (!this.nuevoComplejo.ruc || String(this.nuevoComplejo.ruc).length !== 11) {
      this.mensaje = 'El RUC es obligatorio y debe tener exactamente 11 dígitos.';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.nuevoComplejo.razonSocial) {
      this.mensaje = 'La Razón Social es obligatoria.';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.nuevoComplejo.urlLicencia) {
      this.mensaje = 'Falta subir la Licencia de Funcionamiento.';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.nuevoComplejo.urlFichaRuc) {
      this.mensaje = 'Falta subir la Ficha RUC.';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.nuevoComplejo.urlDniRepresentante) {
      this.mensaje = 'Falta subir el DNI (Anverso).';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.nuevoComplejo.urlDniReverso) {
      this.mensaje = 'Falta subir el DNI (Reverso).';
      this.tipoMensaje = 'error';
      return;
    }
    
    
    this.mostrarModalKyb = false;
    this.mostrarFormComplejo = true;
    this.mensaje = '';
  }

  subirDocumentoKyb(event: any, tipoDocumento: string): void {
    const file = event.target.files[0];
    if (file) {
      this.cargandoDocumentoKyb = true;
      this.complejoService.subirDocumentoKyb(file).subscribe({
        next: (res) => {
          this.cargandoDocumentoKyb = false;
          if (tipoDocumento === 'licencia') this.nuevoComplejo.urlLicencia = res.url;
          else if (tipoDocumento === 'fichaRuc') this.nuevoComplejo.urlFichaRuc = res.url;
          else if (tipoDocumento === 'dniAnverso') this.nuevoComplejo.urlDniRepresentante = res.url;
          else if (tipoDocumento === 'dniReverso') this.nuevoComplejo.urlDniReverso = res.url;
        },
        error: (err) => {
          this.cargandoDocumentoKyb = false;
          console.error('Error al subir documento:', err);
          this.mensaje = 'Error al subir el documento. Inténtelo de nuevo.';
          this.tipoMensaje = 'error';
        }
      });
    }
  }

  intentarCancelarComplejo(): void {
    this.mostrarConfirmacionCancelarComplejo = true;
  }

  confirmarCancelarComplejo(): void {
    this.mostrarConfirmacionCancelarComplejo = false;
    this.mostrarFormComplejo = false;
    this.mensaje = '';
    
    // Resetear formulario y limpiar campos
    this.nuevoComplejo = {
      nombre: '',
      direccion: '',
      ciudad: 'Trujillo',
      telefonoContacto: '',
      yapePlinInfo: '',
      descripcion: '',
      imagenPrincipal: '',
      tipoCobro: 'billetera',
      bancoInfo: '',
      billeteraTipo: '1',
      billeteraNumero: '',
      ruc: '',
      razonSocial: '',
      urlLicencia: '',
      urlFichaRuc: '',
      urlDniRepresentante: '',
      urlDniReverso: ''
    };
    this.comodidades.forEach(c => c.selected = false);
  }

  registrarComplejo(): void {
    if (this.nuevoComplejo.tipoCobro === 'banco') {
      this.nuevoComplejo.yapePlinInfo = `Banco: ${this.nuevoComplejo.bancoInfo}`;
    } else {
      this.nuevoComplejo.yapePlinInfo = `${this.nuevoComplejo.billeteraTipo}: ${this.nuevoComplejo.billeteraNumero}`;
    }

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
          imagenPrincipal: '',
          tipoCobro: 'billetera',
          bancoInfo: '',
          billeteraTipo: '1',
          billeteraNumero: ''
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

  // =========================================================================
  // MÉTODOS: CORRECCIÓN KYB
  // =========================================================================

  abrirModalCorrecionKyb(complejo: any) {
    this.complejoCorrecionKyb = {
      id: complejo.id,
      ruc: complejo.ruc,
      razonSocial: complejo.razonSocial,
      urlLicencia: '',
      urlFichaRuc: '',
      urlDniRepresentante: '',
      urlDniReverso: ''
    };
    this.mostrarModalCorrecionKyb = true;
  }

  cerrarModalCorrecionKyb() {
    this.mostrarModalCorrecionKyb = false;
    this.complejoCorrecionKyb = null;
  }

  subirDocumentoCorrecion(event: any, tipo: string) {
    const file = event.target.files[0];
    if (file) {
      this.cargandoDocumentoKyb = true;
      this.complejoService.subirDocumentoKyb(file).subscribe({
        next: (res) => {
          if (tipo === 'licencia') this.complejoCorrecionKyb.urlLicencia = res.url;
          if (tipo === 'ruc') this.complejoCorrecionKyb.urlFichaRuc = res.url;
          if (tipo === 'dniAnverso') this.complejoCorrecionKyb.urlDniRepresentante = res.url;
          if (tipo === 'dniReverso') this.complejoCorrecionKyb.urlDniReverso = res.url;
          this.cargandoDocumentoKyb = false;
        },
        error: (err) => {
          console.error(err);
          this.mensaje = 'Error al subir documento: ' + (err.error || err.message);
          this.tipoMensaje = 'error';
          this.cargandoDocumentoKyb = false;
        }
      });
    }
  }

  guardarCorrecionKyb() {
    if (!this.complejoCorrecionKyb.ruc || this.complejoCorrecionKyb.ruc.length !== 11) {
      this.mensaje = 'El RUC debe tener exactamente 11 dígitos.';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.complejoCorrecionKyb.razonSocial) {
      this.mensaje = 'La Razón Social es obligatoria.';
      this.tipoMensaje = 'error';
      return;
    }
    if (!this.complejoCorrecionKyb.urlLicencia || !this.complejoCorrecionKyb.urlFichaRuc || !this.complejoCorrecionKyb.urlDniRepresentante || !this.complejoCorrecionKyb.urlDniReverso) {
      this.mensaje = 'Debes subir nuevamente los 4 documentos obligatorios.';
      this.tipoMensaje = 'error';
      return;
    }

    this.cargando = true;
    this.complejoService.actualizarKybComplejo(this.complejoCorrecionKyb.id, this.complejoCorrecionKyb).subscribe({
      next: () => {
        this.mensaje = 'Documentos enviados correctamente. Tu complejo está nuevamente en revisión.';
        this.tipoMensaje = 'exito';
        this.cerrarModalCorrecionKyb();
        this.cargarComplejos();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.mensaje = 'Error al corregir documentos: ' + (err.error || err.message);
        this.tipoMensaje = 'error';
        this.cargando = false;
      }
    });
  }
}

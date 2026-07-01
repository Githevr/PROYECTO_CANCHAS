package com.canchas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// =========================================================================
// ENTIDAD: ReporteReserva
// Permite a un JUGADOR reportar una controversia cuando pagó pero el dueño
// no confirmó la reserva. Incluye hasta 3 evidencias (fotos/capturas).
// =========================================================================
@Entity
@Table(name = "reporte_reserva")
public class ReporteReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reserva que se está reportando
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    // Jugador que levanta el reporte
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "jugador_id", nullable = false)
    private Cliente jugador;

    // Motivo detallado del reporte (obligatorio)
    @Column(nullable = false, length = 1000)
    private String motivo;

    // Estado del reporte: PENDIENTE, RESUELTO_A_FAVOR, RESUELTO_RECHAZADO
    @Column(nullable = false, length = 50)
    private String estado;

    // URLs de evidencia (fotos, capturas de conversación, comprobantes)
    // Se requiere al menos 1 evidencia obligatoria
    @Column(name = "url_evidencia_1", nullable = false)
    private String urlEvidencia1;

    @Column(name = "url_evidencia_2")
    private String urlEvidencia2;

    @Column(name = "url_evidencia_3")
    private String urlEvidencia3;

    // Resolución del admin (opcional, se llena cuando el admin cierra el caso)
    @Column(name = "resolucion_admin", length = 1000)
    private String resolucionAdmin;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDateTime fechaReporte;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    // Constructor por defecto
    public ReporteReserva() {
        this.estado = "PENDIENTE";
        this.fechaReporte = LocalDateTime.now();
    }

    // GETTERS Y SETTERS

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }

    public Cliente getJugador() { return jugador; }
    public void setJugador(Cliente jugador) { this.jugador = jugador; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getUrlEvidencia1() { return urlEvidencia1; }
    public void setUrlEvidencia1(String urlEvidencia1) { this.urlEvidencia1 = urlEvidencia1; }

    public String getUrlEvidencia2() { return urlEvidencia2; }
    public void setUrlEvidencia2(String urlEvidencia2) { this.urlEvidencia2 = urlEvidencia2; }

    public String getUrlEvidencia3() { return urlEvidencia3; }
    public void setUrlEvidencia3(String urlEvidencia3) { this.urlEvidencia3 = urlEvidencia3; }

    public String getResolucionAdmin() { return resolucionAdmin; }
    public void setResolucionAdmin(String resolucionAdmin) { this.resolucionAdmin = resolucionAdmin; }

    public LocalDateTime getFechaReporte() { return fechaReporte; }
    public void setFechaReporte(LocalDateTime fechaReporte) { this.fechaReporte = fechaReporte; }

    public LocalDateTime getFechaResolucion() { return fechaResolucion; }
    public void setFechaResolucion(LocalDateTime fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}

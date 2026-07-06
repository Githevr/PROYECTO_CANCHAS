package com.canchas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "strike_complejo")
public class StrikeComplejo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "complejo_id", nullable = false)
    private ComplejoDeportivo complejo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporte_id")
    private ReporteReserva reporte;

    @Column(name = "motivo_admin", nullable = false, length = 1000)
    private String motivoAdmin;

    @Column(name = "url_evidencia_admin")
    private String urlEvidenciaAdmin;

    // ESTADO: EMITIDO, APELADO, REVOCADO, MANTENIDO
    @Column(nullable = false, length = 50)
    private String estado;

    @Column(name = "motivo_apelacion", length = 1000)
    private String motivoApelacion;

    @Column(name = "url_evidencia_apelacion")
    private String urlEvidenciaApelacion;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    public StrikeComplejo() {
        this.estado = "EMITIDO";
        this.fechaEmision = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComplejoDeportivo getComplejo() {
        return complejo;
    }

    public void setComplejo(ComplejoDeportivo complejo) {
        this.complejo = complejo;
    }

    public ReporteReserva getReporte() {
        return reporte;
    }

    public void setReporte(ReporteReserva reporte) {
        this.reporte = reporte;
    }

    public String getMotivoAdmin() {
        return motivoAdmin;
    }

    public void setMotivoAdmin(String motivoAdmin) {
        this.motivoAdmin = motivoAdmin;
    }

    public String getUrlEvidenciaAdmin() {
        return urlEvidenciaAdmin;
    }

    public void setUrlEvidenciaAdmin(String urlEvidenciaAdmin) {
        this.urlEvidenciaAdmin = urlEvidenciaAdmin;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMotivoApelacion() {
        return motivoApelacion;
    }

    public void setMotivoApelacion(String motivoApelacion) {
        this.motivoApelacion = motivoApelacion;
    }

    public String getUrlEvidenciaApelacion() {
        return urlEvidenciaApelacion;
    }

    public void setUrlEvidenciaApelacion(String urlEvidenciaApelacion) {
        this.urlEvidenciaApelacion = urlEvidenciaApelacion;
    }

    public LocalDateTime getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDateTime fechaEmision) {
        this.fechaEmision = fechaEmision;
    }
}

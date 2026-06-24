package com.canchas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recarga_credito")
public class RecargaCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "propietario_id", nullable = false)
    private Cliente propietario;

    @Column(name = "monto_pagado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoPagado; // Dinero real depositado en Soles

    @Column(name = "creditos_otorgados", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditosOtorgados; // Créditos asignados (monto + promoción)

    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago; // 'YAPE', 'PLIN', 'TRANSFERENCIA'

    @Column(name = "nro_operacion", nullable = false)
    private String nroOperacion;

    @Column(name = "imagen_comprobante", nullable = false)
    private String imagenComprobante; // URL o nombre del archivo de la captura

    @Column(nullable = false)
    private String estado; // 'PENDIENTE', 'APROBADA', 'RECHAZADA'

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    public RecargaCredito() {
        this.estado = "PENDIENTE";
        this.fechaSolicitud = LocalDateTime.now();
    }

    // GETTERS Y SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cliente getPropietario() {
        return propietario;
    }

    public void setPropietario(Cliente propietario) {
        this.propietario = propietario;
    }

    public BigDecimal getMontoPagado() {
        return montoPagado;
    }

    public void setMontoPagado(BigDecimal montoPagado) {
        this.montoPagado = montoPagado;
    }

    public BigDecimal getCreditosOtorgados() {
        return creditosOtorgados;
    }

    public void setCreditosOtorgados(BigDecimal creditosOtorgados) {
        this.creditosOtorgados = creditosOtorgados;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getNroOperacion() {
        return nroOperacion;
    }

    public void setNroOperacion(String nroOperacion) {
        this.nroOperacion = nroOperacion;
    }

    public String getImagenComprobante() {
        return imagenComprobante;
    }

    public void setImagenComprobante(String imagenComprobante) {
        this.imagenComprobante = imagenComprobante;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }
}

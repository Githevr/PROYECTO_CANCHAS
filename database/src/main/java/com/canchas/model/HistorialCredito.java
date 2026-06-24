package com.canchas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_credito")
public class HistorialCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "propietario_id", nullable = false)
    private Cliente propietario;

    @Column(nullable = false)
    private String tipo; // 'RECARGA', 'DESCUENTO_RESERVA', 'DEVOLUCION'

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto; // Positivo para ingresos, Negativo para descuentos

    @Column(nullable = false)
    private String descripcion; // Explicación (Ej: "Comisión de 8% por reserva de Juan Pérez")

    @Column(nullable = false)
    private LocalDateTime fecha;

    public HistorialCredito() {
        this.fecha = LocalDateTime.now();
    }

    public HistorialCredito(Cliente propietario, String tipo, BigDecimal monto, String descripcion) {
        this.propietario = propietario;
        this.tipo = tipo;
        this.monto = monto;
        this.descripcion = descripcion;
        this.fecha = LocalDateTime.now();
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}

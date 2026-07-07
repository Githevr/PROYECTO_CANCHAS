package com.canchas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String apellido;

    private String telefono;

    @Column(unique = true, nullable = false)
    private String correo;

    private String password;

    private Boolean confirmado;

    @Column(name = "codigo_confirmacion")
    private String codigoConfirmacion;

    @Column(nullable = false)
    private String rol; // 'JUGADOR', 'PROPIETARIO', 'ADMIN'

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal creditos; // Saldo de créditos de la plataforma

    @Column(name = "fecha_generacion_codigo")
    private java.time.LocalDateTime fechaGeneracionCodigo;

    @Column(name = "reservas_perdidas")
    private Integer reservasPerdidas;

    // Constructor por defecto
    public Cliente() {
        this.rol = "JUGADOR"; // Rol por defecto
        this.creditos = BigDecimal.ZERO;
    }

    // GETTERS Y SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getConfirmado() {
        return confirmado;
    }

    public void setConfirmado(Boolean confirmado) {
        this.confirmado = confirmado;
    }

    public String getCodigoConfirmacion() {
        return codigoConfirmacion;
    }

    public void setCodigoConfirmacion(String codigoConfirmacion) {
        this.codigoConfirmacion = codigoConfirmacion;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public BigDecimal getCreditos() {
        return creditos;
    }

    public void setCreditos(BigDecimal creditos) {
        this.creditos = creditos;
    }

    public Integer getReservasPerdidas() {
        return reservasPerdidas;
    }

    public void setReservasPerdidas(Integer reservasPerdidas) {
        this.reservasPerdidas = reservasPerdidas;
    }

    public java.time.LocalDateTime getFechaGeneracionCodigo() {
        return fechaGeneracionCodigo;
    }

    public void setFechaGeneracionCodigo(java.time.LocalDateTime fechaGeneracionCodigo) {
        this.fechaGeneracionCodigo = fechaGeneracionCodigo;
    }
}
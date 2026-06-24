package com.canchas.dto;

import java.math.BigDecimal;

public class LoginResponse {

    private Long id;
    private String nombre;
    private String correo;
    private String mensaje;
    private String rol;
    private BigDecimal creditos;

    public LoginResponse() {
    }

    public LoginResponse(
            Long id,
            String nombre,
            String correo,
            String mensaje,
            String rol,
            BigDecimal creditos
    ) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.mensaje = mensaje;
        this.rol = rol;
        this.creditos = creditos;
    }

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

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
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
}
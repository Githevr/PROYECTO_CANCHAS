package com.canchas.dto;

public class LoginResponse {

    private Long id;
    private String nombre;
    private String correo;
    private String mensaje;

    public LoginResponse() {
    }

    public LoginResponse(
            Long id,
            String nombre,
            String correo,
            String mensaje
    ) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.mensaje = mensaje;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
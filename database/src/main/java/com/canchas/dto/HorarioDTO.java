package com.canchas.dto;

public class HorarioDTO {
    private String hora;
    private String estado; // "LIBRE", "BLOQUEADO", "OCUPADO"
    private Long segundosRestantes;

    public HorarioDTO() {}

    public HorarioDTO(String hora, String estado, Long segundosRestantes) {
        this.hora = hora;
        this.estado = estado;
        this.segundosRestantes = segundosRestantes;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getSegundosRestantes() {
        return segundosRestantes;
    }

    public void setSegundosRestantes(Long segundosRestantes) {
        this.segundosRestantes = segundosRestantes;
    }
}

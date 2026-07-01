package com.canchas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
// Unique constraint prevents duplicate ratings per customer-court pair at the DB level
@Table(name = "calificacion", uniqueConstraints = {
    @UniqueConstraint(name = "UK_calificacion_cliente_cancha", columnNames = {"cliente_id", "cancha_id"})
})
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    // Relación añadida para identificar a qué cancha corresponde la calificación
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancha_id", nullable = false)
    private Canchas cancha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private Integer puntuacion; // 1 to 5

    @Column(nullable = false, length = 1000)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fechaCalificacion;

    public Calificacion() {
        this.fechaCalificacion = LocalDateTime.now();
    }

    // GETTERS Y SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFechaCalificacion() {
        return fechaCalificacion;
    }

    public void setFechaCalificacion(LocalDateTime fechaCalificacion) {
        this.fechaCalificacion = fechaCalificacion;
    }

    public Canchas getCancha() {
        return cancha;
    }

    public void setCancha(Canchas cancha) {
        this.cancha = cancha;
    }
}

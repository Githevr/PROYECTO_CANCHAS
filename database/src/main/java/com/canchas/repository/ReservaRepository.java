package com.canchas.repository;

import com.canchas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    boolean existsByCanchaIdAndFechaAndHoraInicio(
            Long canchaId,
            LocalDate fecha,
            LocalTime horaInicio
    );

    List<Reserva> findByCanchaIdAndFecha(
            Long canchaId,
            LocalDate fecha
    );

    List<Reserva> findByClienteId(Long clienteId);

    // Obtener todas las reservas de las canchas pertenecientes a los complejos de un propietario específico
    @Query("SELECT r FROM Reserva r WHERE r.cancha.complejo.propietario.id = :propietarioId ORDER BY r.fecha DESC, r.horaInicio DESC")
    List<Reserva> findByPropietarioId(@Param("propietarioId") Long propietarioId);

    // Buscar reservas en estado PENDIENTE_ADELANTO o CONFIRMADA cuya hora de inicio ya expiró (para liberar por inasistencia)
    @Query("SELECT r FROM Reserva r WHERE r.estado IN ('PENDIENTE_ADELANTO', 'CONFIRMADA') AND (r.fecha < :fecha OR (r.fecha = :fecha AND r.horaInicio <= :limiteHora))")
    List<Reserva> findReservasExpiradas(@Param("fecha") LocalDate fecha, @Param("limiteHora") LocalTime limiteHora);
}
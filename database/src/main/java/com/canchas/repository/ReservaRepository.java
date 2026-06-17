package com.canchas.repository;

import com.canchas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;

public interface ReservaRepository
        extends JpaRepository<Reserva, Long> {

    boolean existsByCanchaIdAndFechaAndHoraInicio(
            Long canchaId,
            LocalDate fecha,
            LocalTime horaInicio
    );
}
package com.canchas.repository;

import com.canchas.model.ReporteReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// =========================================================================
// REPOSITORIO: ReporteReserva
// Consultas JPA para la gestión de reportes de controversia.
// =========================================================================
@Repository
public interface ReporteReservaRepository extends JpaRepository<ReporteReserva, Long> {

    // Buscar reportes por jugador (para la vista "Mis Reportes" del jugador)
    List<ReporteReserva> findByJugadorIdOrderByFechaReporteDesc(Long jugadorId);

    // Buscar reportes pendientes (para el panel del Admin)
    List<ReporteReserva> findByEstadoOrderByFechaReporteAsc(String estado);

    // Verificar si ya existe un reporte para una reserva específica (evitar duplicados)
    boolean existsByReservaId(Long reservaId);
}

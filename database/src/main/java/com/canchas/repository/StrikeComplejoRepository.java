package com.canchas.repository;

import com.canchas.model.StrikeComplejo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StrikeComplejoRepository extends JpaRepository<StrikeComplejo, Long> {

    List<StrikeComplejo> findByComplejoIdOrderByFechaEmisionDesc(Long complejoId);
    
    List<StrikeComplejo> findByComplejoPropietarioIdOrderByFechaEmisionDesc(Long propietarioId);

    // Contar strikes activos (EMITIDO o MANTENIDO o APELADO) de un complejo
    long countByComplejoIdAndEstadoIn(Long complejoId, List<String> estados);
    
    // Obtener todas las apelaciones pendientes para el admin
    List<StrikeComplejo> findByEstadoOrderByFechaEmisionAsc(String estado);
}

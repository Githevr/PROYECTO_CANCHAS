package com.canchas.repository;

import com.canchas.model.HistorialCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialCreditoRepository extends JpaRepository<HistorialCredito, Long> {
    
    // Listar historial de transacciones de créditos de un dueño de más recientes a antiguas
    List<HistorialCredito> findByPropietarioIdOrderByFechaDesc(Long propietarioId);
}

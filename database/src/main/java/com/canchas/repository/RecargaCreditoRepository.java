package com.canchas.repository;

import com.canchas.model.RecargaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecargaCreditoRepository extends JpaRepository<RecargaCredito, Long> {
    
    // Obtener solicitudes de recarga de un dueño ordenadas de más recientes a antiguas
    List<RecargaCredito> findByPropietarioIdOrderByFechaSolicitudDesc(Long propietarioId);
}

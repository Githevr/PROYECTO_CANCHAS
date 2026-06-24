package com.canchas.repository;

import com.canchas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    // Buscar pago asociado a una reserva específica (Relación OneToOne)
    Optional<Pago> findByReservaId(Long reservaId);
}
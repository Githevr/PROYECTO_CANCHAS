package com.canchas.repository;

import com.canchas.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository
        extends JpaRepository<Pago, Long> {
}
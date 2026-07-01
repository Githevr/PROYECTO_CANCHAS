package com.canchas.repository;

import com.canchas.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByClienteId(Long clienteId);
    List<Calificacion> findByReservaId(Long reservaId);
    
    // Método para validar si el cliente ya calificó esta cancha
    boolean existsByClienteIdAndCanchaId(Long clienteId, Long canchaId);
}

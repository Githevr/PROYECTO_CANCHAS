package com.canchas.repository;

import com.canchas.model.Canchas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CanchaRepository extends JpaRepository<Canchas, Long> {

    List<Canchas> findByTipo(String tipo);

    List<Canchas> findByUbicacion(String ubicacion);

    // Listar todas las canchas que pertenecen a un complejo deportivo específico
    List<Canchas> findByComplejoId(Long complejoId);

    // Filtrar canchas activas que pertenecen a un complejo y cuyo dueño tiene créditos
    @Query("SELECT c FROM Canchas c WHERE c.complejo IS NOT NULL AND c.complejo.propietario.creditos > 0.00")
    List<Canchas> findActiveCanchas();
}
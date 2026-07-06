package com.canchas.repository;

import com.canchas.model.ComplejoDeportivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplejoDeportivoRepository extends JpaRepository<ComplejoDeportivo, Long> {
    
    // Buscar complejos registrados por un dueño
    List<ComplejoDeportivo> findByPropietarioId(Long propietarioId);
    
    // Buscar complejos por ciudad (e.g. para el dropdown/textbox de ubicación del jugador)
    List<ComplejoDeportivo> findByCiudadIgnoreCase(String ciudad);

    // Buscar complejos activos (propietarios con saldo > 0) Y aprobados por KYB Y sin 3 strikes, filtrados por ciudad
    @Query("SELECT c FROM ComplejoDeportivo c WHERE LOWER(c.ciudad) = LOWER(:ciudad) AND c.propietario.creditos > 0.00 AND c.estadoVerificacion = 'APPROVED' AND c.activo = true")
    List<ComplejoDeportivo> findComplejosActivosPorCiudad(@Param("ciudad") String ciudad);
}

package com.canchas.repository;

import com.canchas.model.Canchas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CanchaRepository extends JpaRepository<Canchas, Long> {

    List<Canchas> findByTipo(String tipo);

    List<Canchas> findByUbicacion(String ubicacion);

}
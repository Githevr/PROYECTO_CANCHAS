package com.canchas.repository;

import com.canchas.model.Canchas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface CanchaRepository extends JpaRepository<Canchas, Long> {

    List<Canchas> findByTipo(String tipo);

    List<Canchas> findByUbicacion(String ubicacion);

}
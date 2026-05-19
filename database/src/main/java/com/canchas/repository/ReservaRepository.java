package com.canchas.repository;

import com.canchas.model.Reserva;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository
extends JpaRepository<Reserva, Long> {

}
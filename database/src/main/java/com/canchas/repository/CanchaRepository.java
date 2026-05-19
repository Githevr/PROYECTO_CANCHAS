package com.canchas.repository;

import com.canchas.model.Canchas;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CanchaRepository
extends JpaRepository<Canchas, Long> {

}
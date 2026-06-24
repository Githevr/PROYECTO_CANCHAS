package com.canchas.controller;

import com.canchas.model.Canchas;

import com.canchas.repository.CanchaRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/canchas")

@CrossOrigin(origins = "http://localhost:4200")

public class CanchaController {

    private final CanchaRepository canchaRepository;

    public CanchaController(
        CanchaRepository canchaRepository
    ) {
        this.canchaRepository = canchaRepository;
    }

    @GetMapping

    public List<Canchas> listarCanchas() {

        return canchaRepository.findActiveCanchas();

    }
}
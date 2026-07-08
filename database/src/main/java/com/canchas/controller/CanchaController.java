package com.canchas.controller;

import com.canchas.model.Canchas;
import com.canchas.repository.CanchaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/canchas")
@CrossOrigin(origins = "*")
public class CanchaController {

    private final CanchaRepository canchaRepository;

    public CanchaController(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    // Endpoint original: devuelve TODAS las canchas activas (sin paginación)
    @GetMapping
    public List<Canchas> listarCanchas() {
        return canchaRepository.findActiveCanchas();
    }

    // Endpoint PAGINADO: devuelve canchas activas con paginación desde el servidor
    @GetMapping("/paginado")
    public Page<Canchas> listarCanchasPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return canchaRepository.findActiveCanchasPaginado(pageable);
    }

    // Endpoint TOP RATED: devuelve las mejores canchas para el carrusel del inicio
    @GetMapping("/top-rated")
    public List<Canchas> listarTopRated(
            @RequestParam(defaultValue = "10") int limit
    ) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "rating"));
        return canchaRepository.findTopRatedCanchas(pageable);
    }
}
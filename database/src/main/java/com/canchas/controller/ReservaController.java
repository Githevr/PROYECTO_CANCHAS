package com.canchas.controller;

import com.canchas.dto.ReservaRequest;
import com.canchas.model.Reserva;
import com.canchas.service.ReservaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservas")
@CrossOrigin("*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping
    public Reserva reservar(
            @RequestBody ReservaRequest request
    ) {
        return reservaService.crearReserva(request);
    }
}
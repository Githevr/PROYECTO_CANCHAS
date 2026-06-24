package com.canchas.controller;

import com.canchas.dto.ReservaRequest;
import com.canchas.model.Reserva;
import com.canchas.service.ReservaService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservaController {


    private final ReservaService reservaService;

    public ReservaController(
            ReservaService reservaService
    ) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public Reserva reservar(
            @RequestBody ReservaRequest request
    ) {
        return reservaService.crearReserva(request);
    }

    @GetMapping("/disponibilidad/{canchaId}")
    public List<String> obtenerDisponibilidad(

            @PathVariable Long canchaId,

            @RequestParam String fecha

    ) {

        return reservaService.obtenerHorariosDisponibles(
                canchaId,
                LocalDate.parse(fecha)
        );
    }
    @GetMapping("/cliente/{clienteId}")
    public List<Reserva> obtenerReservasCliente(
            @PathVariable Long clienteId
    ) {
        return reservaService.obtenerReservasPorCliente(clienteId);
    }
    @GetMapping("/{id}")
    public Reserva obtenerReserva(
            @PathVariable Long id
    ) {
        return reservaService.obtenerPorId(id);
}
}
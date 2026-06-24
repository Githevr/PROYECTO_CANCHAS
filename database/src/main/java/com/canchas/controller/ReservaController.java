package com.canchas.controller;

import com.canchas.dto.ReservaRequest;
import com.canchas.model.Reserva;
import com.canchas.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public Reserva reservar(@RequestBody ReservaRequest request) {
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
    public List<Reserva> obtenerReservasCliente(@PathVariable Long clienteId) {
        return reservaService.obtenerReservasPorCliente(clienteId);
    }

    @GetMapping("/propietario/{propietarioId}")
    public List<Reserva> obtenerReservasPropietario(@PathVariable Long propietarioId) {
        return reservaService.obtenerReservasPorPropietario(propietarioId);
    }

    @GetMapping("/{id}")
    public Reserva obtenerReserva(@PathVariable Long id) {
        return reservaService.obtenerPorId(id);
    }

    // Endpoint para que el propietario confirme que recibió el adelanto del 50%
    @PostMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarReserva(
            @PathVariable Long id,
            @RequestParam Long propietarioId
    ) {
        try {
            Reserva reserva = reservaService.confirmarReserva(id, propietarioId);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint para que el propietario marque la reserva como totalmente pagada en el local
    @PostMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarPagoReserva(
            @PathVariable Long id,
            @RequestParam Long propietarioId
    ) {
        try {
            Reserva reserva = reservaService.finalizarPagoReserva(id, propietarioId);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint para que el propietario libere la cancha por inasistencia del jugador
    @PostMapping("/{id}/liberar")
    public ResponseEntity<?> liberarReserva(
            @PathVariable Long id,
            @RequestParam Long propietarioId
    ) {
        try {
            Reserva reserva = reservaService.liberarReservaPorInasistencia(id, propietarioId);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
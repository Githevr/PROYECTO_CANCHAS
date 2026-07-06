package com.canchas.controller;

import com.canchas.dto.HorarioDTO;
import com.canchas.dto.ReservaRequest;
import com.canchas.model.Reserva;
import com.canchas.model.ReporteReserva;
import com.canchas.service.ReservaService;
import com.canchas.service.ReporteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;
    private final ReporteService reporteService;

    public ReservaController(ReservaService reservaService, ReporteService reporteService) {
        this.reservaService = reservaService;
        this.reporteService = reporteService;
    }

    @PostMapping
    public Reserva reservar(@RequestBody ReservaRequest request) {
        return reservaService.crearReserva(request);
    }

    @GetMapping("/disponibilidad/{canchaId}")
    public List<HorarioDTO> obtenerDisponibilidad(
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

    // Endpoint para que el jugador cancele voluntariamente (rollback) su reserva PENDIENTE_ADELANTO
    @DeleteMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarReserva(
            @PathVariable Long id,
            @RequestParam Long clienteId
    ) {
        try {
            reservaService.cancelarReservaJugador(id, clienteId);
            return ResponseEntity.ok().body("Reserva cancelada exitosamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // REPORTE DE CONTROVERSIA (El jugador reporta que pagó y no le confirmaron)
    // Requiere al menos 1 evidencia obligatoria (fotos, capturas de conversación)
    // =========================================================================
    @PostMapping("/{id}/reportar")
    public ResponseEntity<?> reportarReserva(
            @PathVariable Long id,
            @RequestParam Long jugadorId,
            @RequestParam String motivo,
            @RequestParam String urlEvidencia1,
            @RequestParam(required = false) String urlEvidencia2,
            @RequestParam(required = false) String urlEvidencia3
    ) {
        try {
            ReporteReserva reporte = reporteService.crearReporte(
                    id, jugadorId, motivo, urlEvidencia1, urlEvidencia2, urlEvidencia3
            );
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Obtener reportes del jugador autenticado
    @GetMapping("/reportes/{jugadorId}")
    public List<ReporteReserva> obtenerReportesJugador(@PathVariable Long jugadorId) {
        return reporteService.obtenerReportesJugador(jugadorId);
    }
}
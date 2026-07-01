package com.canchas.controller;

import com.canchas.model.Calificacion;
import com.canchas.model.Reserva;
import com.canchas.service.CalificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/calificaciones")
@CrossOrigin(origins = "http://localhost:4200")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @GetMapping("/pendiente/{clienteId}")
    public ResponseEntity<Reserva> obtenerPendiente(@PathVariable Long clienteId) {
        Reserva pendiente = calificacionService.obtenerReservaPendienteCalificar(clienteId);
        if (pendiente != null) {
            return ResponseEntity.ok(pendiente);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Calificacion> guardarCalificacion(@RequestBody Map<String, Object> body) {
        Long reservaId = Long.valueOf(body.get("reservaId").toString());
        Long clienteId = Long.valueOf(body.get("clienteId").toString());
        Integer puntuacion = Integer.valueOf(body.get("puntuacion").toString());
        String comentario = body.get("comentario").toString();

        Calificacion c = calificacionService.guardarCalificacion(reservaId, clienteId, puntuacion, comentario);
        return ResponseEntity.ok(c);
    }
}

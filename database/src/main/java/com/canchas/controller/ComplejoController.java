package com.canchas.controller;

import com.canchas.model.Canchas;
import com.canchas.model.ComplejoDeportivo;
import com.canchas.service.ComplejoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/complejos")
@CrossOrigin(origins = "*")
public class ComplejoController {

    private final ComplejoService complejoService;

    public ComplejoController(ComplejoService complejoService) {
        this.complejoService = complejoService;
    }

    // Registrar un complejo deportivo (Exclusivo Propietario)
    @PostMapping
    public ResponseEntity<?> crearComplejo(
            @RequestBody ComplejoDeportivo complejo,
            @RequestParam Long propietarioId
    ) {
        try {
            ComplejoDeportivo nuevoComplejo = complejoService.crearComplejo(complejo, propietarioId);
            return ResponseEntity.ok(nuevoComplejo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Agregar una cancha a un complejo deportivo específico (Exclusivo Propietario)
    @PostMapping("/{complejoId}/canchas")
    public ResponseEntity<?> agregarCancha(
            @PathVariable Long complejoId,
            @RequestBody Canchas cancha
    ) {
        try {
            Canchas nuevaCancha = complejoService.agregarCanchaAComplejo(complejoId, cancha);
            return ResponseEntity.ok(nuevaCancha);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Listar complejos deportivos de un propietario específico (Dashboard de Dueño)
    @GetMapping("/propietario/{propietarioId}")
    public List<ComplejoDeportivo> listarPorPropietario(@PathVariable Long propietarioId) {
        return complejoService.obtenerComplejosPorPropietario(propietarioId);
    }

    // Buscar complejos por ciudad (Buscador del Jugador).
    // Por defecto filtra complejos activos (con saldo de crédito > 0)
    @GetMapping("/buscar")
    public List<ComplejoDeportivo> buscarComplejos(
            @RequestParam String ciudad,
            @RequestParam(defaultValue = "true") boolean soloActivos
    ) {
        return complejoService.obtenerComplejosPorCiudad(ciudad, soloActivos);
    }

    // Obtener detalles de un complejo deportivo
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            ComplejoDeportivo complejo = complejoService.obtenerComplejoPorId(id);
            return ResponseEntity.ok(complejo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Listar las canchas pertenecientes a un complejo deportivo
    @GetMapping("/{complejoId}/canchas")
    public List<Canchas> listarCanchas(@PathVariable Long complejoId) {
        return complejoService.obtenerCanchasPorComplejo(complejoId);
    }
}

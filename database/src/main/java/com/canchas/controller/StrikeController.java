package com.canchas.controller;

import com.canchas.model.StrikeComplejo;
import com.canchas.service.StrikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/strikes")
@CrossOrigin(origins = "*")
public class StrikeController {

    private final StrikeService strikeService;

    public StrikeController(StrikeService strikeService) {
        this.strikeService = strikeService;
    }

    // =========================================================================
    // ENDPOINTS PARA ADMIN
    // =========================================================================

    // Emitir un strike contra un complejo
    @PostMapping("/admin/emitir")
    public ResponseEntity<?> emitirStrike(
            @RequestParam Long complejoId,
            @RequestParam(required = false) Long reporteId,
            @RequestParam String motivoAdmin,
            @RequestParam(required = false) String urlEvidenciaAdmin
    ) {
        try {
            StrikeComplejo strike = strikeService.emitirStrike(complejoId, reporteId, motivoAdmin, urlEvidenciaAdmin);
            return ResponseEntity.ok(strike);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Listar todos los strikes apelados para que el admin los resuelva
    @GetMapping("/admin/apelaciones")
    public ResponseEntity<List<StrikeComplejo>> listarApelaciones() {
        return ResponseEntity.ok(strikeService.listarApelacionesPendientes());
    }

    // Resolver una apelación de strike (REVOCADO o MANTENIDO)
    @PostMapping("/admin/{strikeId}/resolver")
    public ResponseEntity<?> resolverApelacion(
            @PathVariable Long strikeId,
            @RequestParam String estadoDecision // "REVOCADO" o "MANTENIDO"
    ) {
        try {
            StrikeComplejo strike = strikeService.resolverApelacion(strikeId, estadoDecision);
            return ResponseEntity.ok(strike);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // ENDPOINTS PARA PROPIETARIO
    // =========================================================================

    // Obtener los strikes del propietario
    @GetMapping("/propietario/{propietarioId}")
    public ResponseEntity<List<StrikeComplejo>> obtenerStrikesPorPropietario(@PathVariable Long propietarioId) {
        return ResponseEntity.ok(strikeService.obtenerStrikesPorPropietario(propietarioId));
    }

    // Apelar un strike
    @PostMapping("/{strikeId}/apelar")
    public ResponseEntity<?> apelarStrike(
            @PathVariable Long strikeId,
            @RequestParam Long propietarioId,
            @RequestParam String motivoApelacion,
            @RequestParam(required = false) String urlEvidenciaApelacion
    ) {
        try {
            StrikeComplejo strike = strikeService.apelarStrike(strikeId, propietarioId, motivoApelacion, urlEvidenciaApelacion);
            return ResponseEntity.ok(strike);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

package com.canchas.controller;

import com.canchas.model.Cliente;
import com.canchas.model.ComplejoDeportivo;
import com.canchas.model.ReporteReserva;
import com.canchas.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// =========================================================================
// CONTROLADOR: AdminController
// Endpoints exclusivos para el rol ADMIN.
// Protegido en SecurityConfig con .requestMatchers("/admin/**").hasAuthority("ADMIN")
// =========================================================================
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // =========================================================================
    // GESTIÓN DE DUEÑOS (Listar y buscar propietarios por nombre o correo)
    // =========================================================================
    @GetMapping("/duenos")
    public List<Cliente> listarDuenos(@RequestParam(required = false) String search) {
        return adminService.listarDuenos(search);
    }

    // =========================================================================
    // GESTIÓN DE CRÉDITOS (Agregar o quitar créditos manualmente a un dueño)
    // =========================================================================
    @PostMapping("/creditos/agregar")
    public ResponseEntity<?> agregarCreditos(
            @RequestParam Long duenoId,
            @RequestParam BigDecimal monto,
            @RequestParam(required = false) String descripcion
    ) {
        try {
            Cliente dueno = adminService.agregarCreditos(duenoId, monto, descripcion);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Créditos agregados exitosamente");
            response.put("nuevoSaldo", dueno.getCreditos());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/creditos/quitar")
    public ResponseEntity<?> quitarCreditos(
            @RequestParam Long duenoId,
            @RequestParam BigDecimal monto,
            @RequestParam(required = false) String descripcion
    ) {
        try {
            Cliente dueno = adminService.quitarCreditos(duenoId, monto, descripcion);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Créditos descontados exitosamente");
            response.put("nuevoSaldo", dueno.getCreditos());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // VERIFICACIÓN KYB (Listar, Aprobar o Rechazar complejos pendientes)
    // =========================================================================
    @GetMapping("/complejos/pendientes")
    public List<ComplejoDeportivo> listarComplejosPendientes() {
        return adminService.listarComplejosPendientes();
    }

    @PostMapping("/complejos/{id}/aprobar")
    public ResponseEntity<?> aprobarComplejo(@PathVariable Long id) {
        try {
            ComplejoDeportivo complejo = adminService.aprobarComplejo(id);
            return ResponseEntity.ok(complejo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/complejos/{id}/rechazar")
    public ResponseEntity<?> rechazarComplejo(@PathVariable Long id) {
        try {
            ComplejoDeportivo complejo = adminService.rechazarComplejo(id);
            return ResponseEntity.ok(complejo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // CONTROVERSIAS (Listar reportes y resolverlos a favor o rechazarlos)
    // =========================================================================
    @GetMapping("/reportes")
    public List<ReporteReserva> listarReportesPendientes() {
        return adminService.listarReportesPendientes();
    }

    // Resolver a favor del jugador (penaliza al dueño si las pruebas lo validan)
    @PostMapping("/reportes/{id}/favor")
    public ResponseEntity<?> resolverAFavor(
            @PathVariable Long id,
            @RequestParam String resolucion
    ) {
        try {
            ReporteReserva reporte = adminService.resolverAFavor(id, resolucion);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Rechazar el reporte (el dueño no fue culpable)
    @PostMapping("/reportes/{id}/rechazar")
    public ResponseEntity<?> resolverRechazado(
            @PathVariable Long id,
            @RequestParam String resolucion
    ) {
        try {
            ReporteReserva reporte = adminService.resolverRechazado(id, resolucion);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

package com.canchas.controller;

import com.canchas.dto.RecargaCreditoRequest;
import com.canchas.model.HistorialCredito;
import com.canchas.model.RecargaCredito;
import com.canchas.service.CreditoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/creditos")
@CrossOrigin(origins = "*")
public class CreditoController {

    private final CreditoService creditoService;

    public CreditoController(CreditoService creditoService) {
        this.creditoService = creditoService;
    }

    // Registrar solicitud de recarga por parte del propietario
    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitarRecarga(@RequestBody RecargaCreditoRequest request) {
        try {
            RecargaCredito recarga = creditoService.solicitarRecarga(
                    request.getPropietarioId(),
                    request.getMonto(),
                    request.getMetodoPago(),
                    request.getNroOperacion(),
                    request.getImagenComprobante()
            );
            return ResponseEntity.ok(recarga);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Calcular créditos dinámicamente para simulación en el frontend antes de recargar
    @GetMapping("/calcular-promo")
    public ResponseEntity<?> calcularPromo(
            @RequestParam BigDecimal monto,
            @RequestParam Long propietarioId
    ) {
        try {
            boolean esPrimera = creditoService.esPrimeraRecargaPropietario(propietarioId);
            BigDecimal creditosOtorgados = creditoService.calcularCreditosPromocionales(monto, esPrimera);
            return ResponseEntity.ok(creditosOtorgados);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Obtener historial de movimientos de crédito de un propietario
    @GetMapping("/historial/{propietarioId}")
    public List<HistorialCredito> obtenerHistorial(@PathVariable Long propietarioId) {
        return creditoService.obtenerHistorialPropietario(propietarioId);
    }

    // Obtener listado de solicitudes de recarga de un propietario
    @GetMapping("/recargas/{propietarioId}")
    public List<RecargaCredito> obtenerRecargas(@PathVariable Long propietarioId) {
        return creditoService.obtenerRecargasPropietario(propietarioId);
    }

    // Verificar si es la primera recarga del propietario
    @GetMapping("/es-primera/{propietarioId}")
    public ResponseEntity<Boolean> esPrimeraRecarga(@PathVariable Long propietarioId) {
        return ResponseEntity.ok(creditoService.esPrimeraRecargaPropietario(propietarioId));
    }

    // =========================================================================
    // ENDPOINTS DE ADMINISTRACIÓN (ADMINISTRACIÓN GENERAL)
    // =========================================================================

    // Listar solicitudes de recarga pendientes
    @GetMapping("/admin/pendientes")
    public List<RecargaCredito> obtenerPendientes() {
        return creditoService.obtenerRecargasPendientesAdmin();
    }

    // Aprobar recarga de créditos
    @PostMapping("/admin/aprobar/{id}")
    public ResponseEntity<?> aprobarRecarga(@PathVariable Long id) {
        try {
            RecargaCredito recarga = creditoService.aprobarRecarga(id);
            return ResponseEntity.ok(recarga);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Rechazar recarga de créditos
    @PostMapping("/admin/rechazar/{id}")
    public ResponseEntity<?> rechazarRecarga(@PathVariable Long id) {
        try {
            RecargaCredito recarga = creditoService.rechazarRecarga(id);
            return ResponseEntity.ok(recarga);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

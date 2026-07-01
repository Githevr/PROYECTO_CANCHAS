package com.canchas.service;

import com.canchas.model.Cliente;
import com.canchas.model.ComplejoDeportivo;
import com.canchas.model.HistorialCredito;
import com.canchas.model.ReporteReserva;
import com.canchas.repository.ClienteRepository;
import com.canchas.repository.ComplejoDeportivoRepository;
import com.canchas.repository.HistorialCreditoRepository;
import com.canchas.repository.ReporteReservaRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// =========================================================================
// SERVICIO: AdminService
// Lógica de negocio exclusiva del rol ADMIN.
// Gestión de dueños, créditos manuales, verificación KYB y controversias.
// =========================================================================
@Service
public class AdminService {

    private final ClienteRepository clienteRepository;
    private final ComplejoDeportivoRepository complejoRepository;
    private final HistorialCreditoRepository historialRepository;
    private final ReporteReservaRepository reporteRepository;

    public AdminService(
            ClienteRepository clienteRepository,
            ComplejoDeportivoRepository complejoRepository,
            HistorialCreditoRepository historialRepository,
            ReporteReservaRepository reporteRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.complejoRepository = complejoRepository;
        this.historialRepository = historialRepository;
        this.reporteRepository = reporteRepository;
    }

    // =========================================================================
    // GESTIÓN DE DUEÑOS Y CRÉDITOS
    // =========================================================================

    // Listar todos los propietarios registrados, con filtro opcional por nombre o correo
    public List<Cliente> listarDuenos(String search) {
        List<Cliente> todos = clienteRepository.findAll();
        return todos.stream()
                .filter(c -> "PROPIETARIO".equals(c.getRol()))
                .filter(c -> {
                    if (search == null || search.isBlank()) return true;
                    String lower = search.toLowerCase();
                    // Busca por nombre o por correo
                    boolean matchNombre = c.getNombre() != null && c.getNombre().toLowerCase().contains(lower);
                    boolean matchCorreo = c.getCorreo() != null && c.getCorreo().toLowerCase().contains(lower);
                    return matchNombre || matchCorreo;
                })
                .collect(Collectors.toList());
    }

    // Agregar créditos a un dueño (Admin da saldo manualmente)
    @Transactional
    public Cliente agregarCreditos(Long duenoId, BigDecimal monto, String descripcion) {
        Cliente dueno = clienteRepository.findById(duenoId)
                .orElseThrow(() -> new RuntimeException("Dueño no encontrado"));

        if (!"PROPIETARIO".equals(dueno.getRol())) {
            throw new RuntimeException("Este usuario no es PROPIETARIO.");
        }

        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto debe ser mayor a 0.");
        }

        // Sumar créditos al saldo actual
        dueno.setCreditos(dueno.getCreditos().add(monto));
        clienteRepository.save(dueno);

        // Registrar en historial de créditos
        HistorialCredito historial = new HistorialCredito(
                dueno, "RECARGA_ADMIN",
                monto,
                descripcion != null ? descripcion : "Créditos agregados por el Administrador"
        );
        historialRepository.save(historial);

        return dueno;
    }

    // Quitar créditos a un dueño (Admin descuenta saldo manualmente)
    @Transactional
    public Cliente quitarCreditos(Long duenoId, BigDecimal monto, String descripcion) {
        Cliente dueno = clienteRepository.findById(duenoId)
                .orElseThrow(() -> new RuntimeException("Dueño no encontrado"));

        if (!"PROPIETARIO".equals(dueno.getRol())) {
            throw new RuntimeException("Este usuario no es PROPIETARIO.");
        }

        if (monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto debe ser mayor a 0.");
        }

        if (dueno.getCreditos().compareTo(monto) < 0) {
            throw new RuntimeException("El dueño no tiene saldo suficiente para descontar S/ " + monto);
        }

        // Restar créditos del saldo actual
        dueno.setCreditos(dueno.getCreditos().subtract(monto));
        clienteRepository.save(dueno);

        // Registrar en historial con monto negativo
        HistorialCredito historial = new HistorialCredito(
                dueno, "DESCUENTO_ADMIN",
                monto.negate(),
                descripcion != null ? descripcion : "Créditos descontados por el Administrador"
        );
        historialRepository.save(historial);

        return dueno;
    }

    // =========================================================================
    // VERIFICACIÓN KYB (Know Your Business) - Complejos Deportivos
    // =========================================================================

    // Listar complejos pendientes de verificación para revisión del Admin
    public List<ComplejoDeportivo> listarComplejosPendientes() {
        return complejoRepository.findAll().stream()
                .filter(c -> "PENDING_VERIFICATION".equals(c.getEstadoVerificacion()))
                .collect(Collectors.toList());
    }

    // Aprobar un complejo deportivo (cambia estado a APPROVED)
    @Transactional
    public ComplejoDeportivo aprobarComplejo(Long complejoId) {
        ComplejoDeportivo complejo = complejoRepository.findById(complejoId)
                .orElseThrow(() -> new RuntimeException("Complejo no encontrado"));

        if (!"PENDING_VERIFICATION".equals(complejo.getEstadoVerificacion())) {
            throw new RuntimeException("Este complejo ya fue procesado anteriormente.");
        }

        complejo.setEstadoVerificacion("APPROVED");
        return complejoRepository.save(complejo);
    }

    // Rechazar un complejo deportivo (cambia estado a REJECTED)
    @Transactional
    public ComplejoDeportivo rechazarComplejo(Long complejoId) {
        ComplejoDeportivo complejo = complejoRepository.findById(complejoId)
                .orElseThrow(() -> new RuntimeException("Complejo no encontrado"));

        if (!"PENDING_VERIFICATION".equals(complejo.getEstadoVerificacion())) {
            throw new RuntimeException("Este complejo ya fue procesado anteriormente.");
        }

        complejo.setEstadoVerificacion("REJECTED");
        return complejoRepository.save(complejo);
    }

    // =========================================================================
    // CONTROVERSIAS / REPORTES
    // =========================================================================

    // Listar todos los reportes pendientes para que el admin los revise
    public List<ReporteReserva> listarReportesPendientes() {
        return reporteRepository.findByEstadoOrderByFechaReporteAsc("PENDIENTE");
    }

    // Resolver un reporte a favor del jugador (penaliza al dueño)
    @Transactional
    public ReporteReserva resolverAFavor(Long reporteId, String resolucion) {
        ReporteReserva reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        if (!"PENDIENTE".equals(reporte.getEstado())) {
            throw new RuntimeException("Este reporte ya fue resuelto.");
        }

        reporte.setEstado("RESUELTO_A_FAVOR");
        reporte.setResolucionAdmin(resolucion);
        reporte.setFechaResolucion(LocalDateTime.now());

        return reporteRepository.save(reporte);
    }

    // Resolver rechazando el reporte (no hay penalización)
    @Transactional
    public ReporteReserva resolverRechazado(Long reporteId, String resolucion) {
        ReporteReserva reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        if (!"PENDIENTE".equals(reporte.getEstado())) {
            throw new RuntimeException("Este reporte ya fue resuelto.");
        }

        reporte.setEstado("RESUELTO_RECHAZADO");
        reporte.setResolucionAdmin(resolucion);
        reporte.setFechaResolucion(LocalDateTime.now());

        return reporteRepository.save(reporte);
    }
}

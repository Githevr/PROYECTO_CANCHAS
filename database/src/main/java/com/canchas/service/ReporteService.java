package com.canchas.service;

import com.canchas.model.Cliente;
import com.canchas.model.ReporteReserva;
import com.canchas.model.Reserva;
import com.canchas.repository.ClienteRepository;
import com.canchas.repository.ReporteReservaRepository;
import com.canchas.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;

// =========================================================================
// SERVICIO: ReporteService
// Lógica de negocio para que el JUGADOR pueda crear reportes de controversia.
// =========================================================================
@Service
public class ReporteService {

    private final ReporteReservaRepository reporteRepository;
    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;

    public ReporteService(
            ReporteReservaRepository reporteRepository,
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository
    ) {
        this.reporteRepository = reporteRepository;
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
    }

    // Crear un reporte de controversia (el jugador reporta que pagó y no le confirmaron)
    @Transactional
    public ReporteReserva crearReporte(
            Long reservaId,
            Long jugadorId,
            String motivo,
            String urlEvidencia1,
            String urlEvidencia2,
            String urlEvidencia3
    ) {
        // Validar que la reserva existe
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Validar que el jugador es el dueño de la reserva
        if (!reserva.getCliente().getId().equals(jugadorId)) {
            throw new RuntimeException("No puedes reportar una reserva que no te pertenece.");
        }

        // Validar que no se duplique el reporte
        if (reporteRepository.existsByReservaId(reservaId)) {
            throw new RuntimeException("Ya existe un reporte activo para esta reserva.");
        }

        // Validar que se suba al menos 1 evidencia obligatoria
        if (urlEvidencia1 == null || urlEvidencia1.isBlank()) {
            throw new RuntimeException("Debes subir al menos 1 imagen de evidencia (comprobante, captura de conversación).");
        }

        // Validar que el motivo no esté vacío
        if (motivo == null || motivo.isBlank()) {
            throw new RuntimeException("Debes escribir el motivo detallado del reporte.");
        }

        // Crear el reporte
        Cliente jugador = clienteRepository.findById(jugadorId)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

        ReporteReserva reporte = new ReporteReserva();
        reporte.setReserva(reserva);
        reporte.setJugador(jugador);
        reporte.setMotivo(motivo);
        reporte.setUrlEvidencia1(urlEvidencia1);
        reporte.setUrlEvidencia2(urlEvidencia2);
        reporte.setUrlEvidencia3(urlEvidencia3);

        return reporteRepository.save(reporte);
    }

    // Obtener reportes del jugador autenticado
    public List<ReporteReserva> obtenerReportesJugador(Long jugadorId) {
        return reporteRepository.findByJugadorIdOrderByFechaReporteDesc(jugadorId);
    }
}

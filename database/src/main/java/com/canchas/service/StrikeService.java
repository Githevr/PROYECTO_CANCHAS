package com.canchas.service;

import com.canchas.model.ComplejoDeportivo;
import com.canchas.model.ReporteReserva;
import com.canchas.model.StrikeComplejo;
import com.canchas.repository.ComplejoDeportivoRepository;
import com.canchas.repository.ReporteReservaRepository;
import com.canchas.repository.StrikeComplejoRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class StrikeService {

    private final StrikeComplejoRepository strikeRepository;
    private final ComplejoDeportivoRepository complejoRepository;
    private final ReporteReservaRepository reporteRepository;

    public StrikeService(StrikeComplejoRepository strikeRepository,
                         ComplejoDeportivoRepository complejoRepository,
                         ReporteReservaRepository reporteRepository) {
        this.strikeRepository = strikeRepository;
        this.complejoRepository = complejoRepository;
        this.reporteRepository = reporteRepository;
    }

    @Transactional
    public StrikeComplejo emitirStrike(Long complejoId, Long reporteId, String motivoAdmin, String urlEvidenciaAdmin) {
        ComplejoDeportivo complejo = complejoRepository.findById(complejoId)
                .orElseThrow(() -> new RuntimeException("Complejo no encontrado"));

        ReporteReserva reporte = null;
        if (reporteId != null) {
            reporte = reporteRepository.findById(reporteId).orElse(null);
            if (reporte != null) {
                reporte.setEstado("RESUELTO_A_FAVOR");
                reporte.setResolucionAdmin(motivoAdmin);
                reporte.setFechaResolucion(java.time.LocalDateTime.now());
                reporteRepository.save(reporte);
            }
        }

        StrikeComplejo strike = new StrikeComplejo();
        strike.setComplejo(complejo);
        strike.setReporte(reporte);
        strike.setMotivoAdmin(motivoAdmin);
        strike.setUrlEvidenciaAdmin(urlEvidenciaAdmin);
        
        strike = strikeRepository.save(strike);

        verificarInactivacion(complejoId);

        return strike;
    }

    public List<StrikeComplejo> listarApelacionesPendientes() {
        return strikeRepository.findByEstadoOrderByFechaEmisionAsc("APELADO");
    }

    @Transactional
    public StrikeComplejo resolverApelacion(Long strikeId, String estadoDecision) {
        StrikeComplejo strike = strikeRepository.findById(strikeId)
                .orElseThrow(() -> new RuntimeException("Strike no encontrado"));

        if (!"APELADO".equals(strike.getEstado())) {
            throw new RuntimeException("El strike no está en estado de apelación.");
        }

        if (!"REVOCADO".equals(estadoDecision) && !"MANTENIDO".equals(estadoDecision)) {
            throw new RuntimeException("Decisión inválida. Debe ser REVOCADO o MANTENIDO.");
        }

        strike.setEstado(estadoDecision);
        strike = strikeRepository.save(strike);

        // Si se revoca el strike y estaba asociado a un reporte, el reporte original pasa a rechazado
        if ("REVOCADO".equals(estadoDecision) && strike.getReporte() != null) {
            ReporteReserva reporte = strike.getReporte();
            reporte.setEstado("RESUELTO_RECHAZADO");
            reporte.setResolucionAdmin("El strike emitido a favor del jugador fue REVOCADO exitosamente tras la apelación del dueño de la cancha.");
            reporteRepository.save(reporte);
        }

        verificarInactivacion(strike.getComplejo().getId());

        return strike;
    }

    public List<StrikeComplejo> obtenerStrikesPorPropietario(Long propietarioId) {
        return strikeRepository.findByComplejoPropietarioIdOrderByFechaEmisionDesc(propietarioId);
    }

    @Transactional
    public StrikeComplejo apelarStrike(Long strikeId, Long propietarioId, String motivoApelacion, String urlEvidenciaApelacion) {
        StrikeComplejo strike = strikeRepository.findById(strikeId)
                .orElseThrow(() -> new RuntimeException("Strike no encontrado"));

        if (!strike.getComplejo().getPropietario().getId().equals(propietarioId)) {
            throw new RuntimeException("No tienes permiso para apelar este strike.");
        }

        if (!"EMITIDO".equals(strike.getEstado())) {
            throw new RuntimeException("Solo se pueden apelar strikes recién emitidos.");
        }

        strike.setMotivoApelacion(motivoApelacion);
        strike.setUrlEvidenciaApelacion(urlEvidenciaApelacion);
        strike.setEstado("APELADO");

        return strikeRepository.save(strike);
    }

    private void verificarInactivacion(Long complejoId) {
        // Los strikes que cuentan para la inactivación son los vigentes: EMITIDO, APELADO, MANTENIDO
        long strikesActivos = strikeRepository.countByComplejoIdAndEstadoIn(
                complejoId, Arrays.asList("EMITIDO", "APELADO", "MANTENIDO"));

        ComplejoDeportivo complejo = complejoRepository.findById(complejoId).orElse(null);
        if (complejo != null) {
            if (strikesActivos >= 3) {
                complejo.setActivo(false);
            } else {
                complejo.setActivo(true);
            }
            complejoRepository.save(complejo);
        }
    }
}

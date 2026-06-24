package com.canchas.service;

import com.canchas.model.Cliente;
import com.canchas.model.HistorialCredito;
import com.canchas.model.RecargaCredito;
import com.canchas.repository.ClienteRepository;
import com.canchas.repository.HistorialCreditoRepository;
import com.canchas.repository.RecargaCreditoRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditoService {

    private final RecargaCreditoRepository recargaRepository;
    private final HistorialCreditoRepository historialRepository;
    private final ClienteRepository clienteRepository;

    public CreditoService(
            RecargaCreditoRepository recargaRepository,
            HistorialCreditoRepository historialRepository,
            ClienteRepository clienteRepository
    ) {
        this.recargaRepository = recargaRepository;
        this.historialRepository = historialRepository;
        this.clienteRepository = clienteRepository;
    }

    /**
     * Calcula los créditos finales a otorgar basándose en el monto de depósito
     * y las promociones vigentes de la plataforma.
     */
    public BigDecimal calcularCreditosPromocionales(BigDecimal monto, boolean esPrimeraRecarga) {
        if (monto.compareTo(BigDecimal.valueOf(50.00)) < 0) {
            throw new IllegalArgumentException("El monto mínimo de recarga es S/ 50.00");
        }

        if (esPrimeraRecarga) {
            // Promoción: Duplica los créditos en tu primera recarga (e.g. Recargas S/ 50 -> Recibes S/ 100)
            return monto.multiply(BigDecimal.valueOf(2));
        }

        // Promociones para recargas regulares subsecuentes
        if (monto.compareTo(BigDecimal.valueOf(200.00)) >= 0) {
            // Recargas S/ 200 a más -> Recibes S/ 50.00 de regalo (S/ 200 -> S/ 250)
            return monto.add(BigDecimal.valueOf(50.00));
        } else if (monto.compareTo(BigDecimal.valueOf(100.00)) >= 0) {
            // Recargas S/ 100 a más -> Recibes S/ 20.00 de regalo (S/ 100 -> S/ 120)
            return monto.add(BigDecimal.valueOf(20.00));
        } else {
            return monto;
        }
    }

    /**
     * Permite a un propietario registrar una nueva solicitud de recarga de créditos.
     */
    @Transactional
    public RecargaCredito solicitarRecarga(
            Long propietarioId,
            BigDecimal monto,
            String metodoPago,
            String nroOperacion,
            String imagenComprobante
    ) {
        Cliente propietario = clienteRepository.findById(propietarioId)
                .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));

        if (!"PROPIETARIO".equals(propietario.getRol())) {
            throw new RuntimeException("Solo los usuarios con rol de PROPIETARIO pueden recargar créditos.");
        }

        // 1. Detectar si es su primera recarga
        // Se considera primera recarga si no tiene ninguna solicitud previamente aprobada
        List<RecargaCredito> recargasPrevias = recargaRepository.findByPropietarioIdOrderByFechaSolicitudDesc(propietarioId);
        boolean esPrimeraRecarga = recargasPrevias.stream()
                .noneMatch(r -> "APROBADA".equals(r.getEstado()));

        // 2. Calcular los créditos a otorgar
        BigDecimal creditosCalcular = calcularCreditosPromocionales(monto, esPrimeraRecarga);

        // 3. Registrar la solicitud
        RecargaCredito recarga = new RecargaCredito();
        recarga.setPropietario(propietario);
        recarga.setMontoPagado(monto);
        recarga.setCreditosOtorgados(creditosCalcular);
        recarga.setMetodoPago(metodoPago.toUpperCase());
        recarga.setNroOperacion(nroOperacion);
        recarga.setImagenComprobante(imagenComprobante);
        recarga.setEstado("PENDIENTE");
        recarga.setFechaSolicitud(LocalDateTime.now());

        return recargaRepository.save(recarga);
    }

    /**
     * Permite al Administrador general de la plataforma aprobar una solicitud de recarga.
     */
    @Transactional
    public RecargaCredito aprobarRecarga(Long recargaId) {
        RecargaCredito recarga = recargaRepository.findById(recargaId)
                .orElseThrow(() -> new RuntimeException("Solicitud de recarga no encontrada"));

        if (!"PENDIENTE".equals(recarga.getEstado())) {
            throw new RuntimeException("Esta solicitud de recarga ya fue procesada previamente.");
        }

        Cliente propietario = recarga.getPropietario();
        BigDecimal creditosAotorgar = recarga.getCreditosOtorgados();

        // 1. Abonar saldo de créditos al propietario
        propietario.setCreditos(propietario.getCreditos().add(creditosAotorgar));
        clienteRepository.save(propietario);

        // 2. Registrar en el historial de créditos
        String descripcion = String.format("Abono por recarga aprobada (Monto: S/ %.2f, Operación: #%s)",
                recarga.getMontoPagado(),
                recarga.getNroOperacion());
        
        HistorialCredito historial = new HistorialCredito(
                propietario,
                "RECARGA",
                creditosAotorgar,
                descripcion
        );
        historialRepository.save(historial);

        // 3. Actualizar estado de la solicitud
        recarga.setEstado("APROBADA");
        recarga.setFechaAprobacion(LocalDateTime.now());

        return recargaRepository.save(recarga);
    }

    /**
     * Permite al Administrador general de la plataforma rechazar una solicitud de recarga.
     */
    @Transactional
    public RecargaCredito rechazarRecarga(Long recargaId) {
        RecargaCredito recarga = recargaRepository.findById(recargaId)
                .orElseThrow(() -> new RuntimeException("Solicitud de recarga no encontrada"));

        if (!"PENDIENTE".equals(recarga.getEstado())) {
            throw new RuntimeException("Esta solicitud de recarga ya fue procesada previamente.");
        }

        recarga.setEstado("RECHAZADA");
        recarga.setFechaAprobacion(LocalDateTime.now()); // Registra cuándo se procesó

        return recargaRepository.save(recarga);
    }

    public List<HistorialCredito> obtenerHistorialPropietario(Long propietarioId) {
        return historialRepository.findByPropietarioIdOrderByFechaDesc(propietarioId);
    }

    public List<RecargaCredito> obtenerRecargasPropietario(Long propietarioId) {
        return recargaRepository.findByPropietarioIdOrderByFechaSolicitudDesc(propietarioId);
    }

    public List<RecargaCredito> obtenerRecargasPendientesAdmin() {
        return recargaRepository.findAll().stream()
                .filter(r -> "PENDIENTE".equals(r.getEstado()))
                .collect(Collectors.toList());
    }

    /**
     * Detecta si es la primera recarga del propietario para propósitos informativos en el front.
     */
    public boolean esPrimeraRecargaPropietario(Long propietarioId) {
        List<RecargaCredito> recargasPrevias = recargaRepository.findByPropietarioIdOrderByFechaSolicitudDesc(propietarioId);
        return recargasPrevias.stream().noneMatch(r -> "APROBADA".equals(r.getEstado()));
    }
}

package com.canchas.service;

import com.canchas.config.ConfiguracionPlataforma;
import com.canchas.dto.ReservaRequest;
import com.canchas.dto.HorarioDTO;
import com.canchas.model.*;
import com.canchas.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final CanchaRepository canchaRepository;
    private final PagoRepository pagoRepository;
    private final HistorialCreditoRepository historialCreditoRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            CanchaRepository canchaRepository,
            PagoRepository pagoRepository,
            HistorialCreditoRepository historialCreditoRepository
    ) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.canchaRepository = canchaRepository;
        this.pagoRepository = pagoRepository;
        this.historialCreditoRepository = historialCreditoRepository;
    }

    @Transactional(noRollbackFor = IllegalStateException.class)
    public Reserva crearReserva(ReservaRequest request) {
        Canchas cancha = canchaRepository.findById(request.getCanchaId())
                .orElseThrow(() -> new RuntimeException("Cancha no encontrada"));

        // 1. REGLA DE NEGOCIO REFINADA: Una cancha está ocupada si la reserva está CONFIRMADA o PAGADA.
        // O si está en 'PENDIENTE_ADELANTO' pero su fechaExpiracionBloqueo aún no ha pasado (Bloqueo de 10 min).
        LocalDateTime ahora = LocalDateTime.now();
        List<Reserva> reservasExistentes = reservaRepository.findByCanchaIdAndFecha(request.getCanchaId(), request.getFecha());
        boolean ocupada = reservasExistentes.stream()
                .anyMatch(r -> r.getHoraInicio().equals(request.getHoraInicio()) && 
                               (r.getEstado().equals("CONFIRMADA") || r.getEstado().equals("PAGADO") ||
                               r.getEstado().equals("ESPERANDO_CONFIRMACION") ||
                               (r.getEstado().equals("PENDIENTE_ADELANTO") && r.getFechaExpiracionBloqueo() != null && ahora.isBefore(r.getFechaExpiracionBloqueo()))));

        if (ocupada) {
            throw new RuntimeException("La cancha ya se encuentra reservada y confirmada en ese horario por otro usuario.");
        }

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        ComplejoDeportivo complejo = cancha.getComplejo();
        if (complejo == null) {
            throw new RuntimeException("Esta cancha no está asociada a ningún complejo deportivo activo.");
        }

        Cliente propietario = complejo.getPropietario();
        
        // El precio total se basa en el precio por hora de la cancha
        BigDecimal precioTotal = BigDecimal.valueOf(cancha.getPrecio());
        
        // Obtener la comisión del 8% utilizando el Singleton
        double factorComision = ConfiguracionPlataforma.getInstancia().getComisionPorcentaje();
        BigDecimal comisionAplicada = precioTotal.multiply(BigDecimal.valueOf(factorComision));

        // Validar que el dueño tenga saldo de créditos suficiente en la plataforma
        if (propietario.getCreditos().compareTo(comisionAplicada) < 0) {
            int perdidasActuales = propietario.getReservasPerdidas() != null ? propietario.getReservasPerdidas() : 0;
            propietario.setReservasPerdidas(perdidasActuales + 1);
            clienteRepository.save(propietario);
            throw new IllegalStateException("El complejo deportivo no puede recibir reservas temporalmente por saldo de créditos insuficiente.");
        }

        // 2. Crear la reserva en estado PENDIENTE_ADELANTO (Aún no bloquea el horario oficialmente hasta que yapee)
        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setCancha(cancha);
        reserva.setFecha(request.getFecha());
        reserva.setHoraInicio(request.getHoraInicio());
        reserva.setHoraFin(request.getHoraInicio().plusHours(1));
        reserva.setPrecioTotal(precioTotal);
        reserva.setComisionAplicada(comisionAplicada);
        reserva.setEstado("PENDIENTE_ADELANTO"); 
        reserva.setFechaExpiracionBloqueo(LocalDateTime.now().plusMinutes(10)); 

        reserva = reservaRepository.save(reserva);

        // 3. Registrar el Pago como PENDIENTE
        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(precioTotal.doubleValue());
        pago.setMetodoPago("DIRECTO AL PROPIETARIO");
        pago.setFechaPago(LocalDateTime.now());
        pago.setEstado("PENDIENTE");

        pagoRepository.save(pago);

        return reserva;
    }

    @Transactional
    public Reserva vincularComprobantePago(Long reservaId, String numeroOperacion, String urlComprobante) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!"PENDIENTE_ADELANTO".equals(reserva.getEstado())) {
            throw new RuntimeException("Solo se pueden subir comprobantes en reservas PENDIENTES.");
        }

        // Cambiar estado y quitar expiración, ya que subió su comprobante, la cancha queda bloqueada a la espera del dueño
        reserva.setEstado("ESPERANDO_CONFIRMACION");
        reserva.setFechaExpiracionBloqueo(null);

        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new RuntimeException("Registro de pago no encontrado"));
        
        pago.setNumeroOperacion(numeroOperacion);
        pago.setUrlComprobante(urlComprobante);
        pago.setFechaPago(LocalDateTime.now());
        pagoRepository.save(pago);

        return reservaRepository.save(reserva);
    }

    @Transactional
    public void cancelarReservaJugador(Long reservaId, Long clienteId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!reserva.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("No tiene permisos para cancelar esta reserva.");
        }

        if (!reserva.getEstado().equals("PENDIENTE_ADELANTO")) {
            throw new RuntimeException("Solo se pueden cancelar reservas que están pendientes de pago.");
        }

        pagoRepository.findByReservaId(reservaId).ifPresent(pagoRepository::delete);
        reservaRepository.delete(reserva);
    }

    @Transactional
    public Reserva confirmarReserva(Long reservaId, Long propietarioId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        ComplejoDeportivo complejo = reserva.getCancha().getComplejo();
        if (complejo == null || !complejo.getPropietario().getId().equals(propietarioId)) {
            throw new RuntimeException("No tiene permisos para confirmar esta reserva.");
        }

        if (!reserva.getEstado().equals("PENDIENTE_ADELANTO") && !reserva.getEstado().equals("ESPERANDO_CONFIRMACION")) {
            throw new RuntimeException("La reserva no está en un estado válido para confirmar. Estado actual: " + reserva.getEstado());
        }

        // 1. REGLA DE NEGOCIO CLAVE: Verificar en tiempo real que otra persona no haya confirmado este mismo horario antes.
        List<Reserva> reservasExistentes = reservaRepository.findByCanchaIdAndFecha(reserva.getCancha().getId(), reserva.getFecha());
        boolean yaOcupada = reservasExistentes.stream()
                .anyMatch(r -> !r.getId().equals(reservaId) && 
                               r.getHoraInicio().equals(reserva.getHoraInicio()) && 
                               (r.getEstado().equals("CONFIRMADA") || r.getEstado().equals("PAGADO")));

        if (yaOcupada) {
            // Si otra reserva se confirmó primero, cancelamos esta automáticamente para evitar conflictos
            reserva.setEstado("LIBERADA_POR_INASISTENCIA"); // O estado RECHAZADA
            reservaRepository.save(reserva);
            throw new RuntimeException("El horario ya fue confirmado y reservado por otro jugador que pagó primero. Esta solicitud ha sido anulada.");
        }

        Cliente propietario = complejo.getPropietario();
        BigDecimal comision = reserva.getComisionAplicada();

        // Verificar créditos del dueño
        if (propietario.getCreditos().compareTo(comision) < 0) {
            throw new RuntimeException("Saldo de créditos insuficiente. Por favor, recargue saldo en la sección Mis Créditos para confirmar esta reserva.");
        }

        // 2. Descontar la comisión del 8% sobre el total
        propietario.setCreditos(propietario.getCreditos().subtract(comision));
        clienteRepository.save(propietario);

        // Registrar en el historial de créditos
        String descripcionHistorial = String.format("Comisión (8%%) por reserva de %s en %s (Total: S/ %.2f)",
                reserva.getCliente().getNombre(),
                reserva.getCancha().getNombre(),
                reserva.getPrecioTotal());
        
        HistorialCredito historial = new HistorialCredito(
                propietario,
                "DESCUENTO_RESERVA",
                comision.negate(),
                descripcionHistorial
        );
        historialCreditoRepository.save(historial);

        // 3. Confirmar la reserva (Ahora sí bloquea el horario oficialmente en el sistema)
        reserva.setEstado("CONFIRMADA");
        
        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElse(new Pago());
        pago.setReserva(reserva);
        pago.setEstado("PAGO_PARCIAL"); // 50% recibido

        pagoRepository.save(pago);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva finalizarPagoReserva(Long reservaId, Long propietarioId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        ComplejoDeportivo complejo = reserva.getCancha().getComplejo();
        if (complejo == null || !complejo.getPropietario().getId().equals(propietarioId)) {
            throw new RuntimeException("No tiene permisos para modificar esta reserva.");
        }

        if (!reserva.getEstado().equals("CONFIRMADA")) {
            throw new RuntimeException("Solo se pueden finalizar reservas que estén previamente CONFIRMADAS.");
        }

        reserva.setEstado("PAGADO");

        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new RuntimeException("Registro de pago no encontrado"));
        pago.setEstado("PAGADO");

        pagoRepository.save(pago);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva liberarReservaPorInasistencia(Long reservaId, Long propietarioId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        ComplejoDeportivo complejo = reserva.getCancha().getComplejo();
        if (complejo == null || !complejo.getPropietario().getId().equals(propietarioId)) {
            throw new RuntimeException("No tiene permisos para liberar esta reserva.");
        }

        String estadoActual = reserva.getEstado();
        if (!estadoActual.equals("CONFIRMADA")) {
            throw new RuntimeException("Solo se puede liberar por inasistencia una reserva que ya estaba CONFIRMADA.");
        }

        // Marcar inasistencia. La cancha queda libre y el dueño retiene el 50% de garantía.
        reserva.setEstado("LIBERADA_POR_INASISTENCIA");

        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new RuntimeException("Registro de pago no encontrado"));
        pago.setEstado("LIBERADA_POR_INASISTENCIA");

        pagoRepository.save(pago);
        return reservaRepository.save(reserva);
    }

    public List<Reserva> obtenerReservasPorPropietario(Long propietarioId) {
        return reservaRepository.findByPropietarioId(propietarioId);
    }

    public List<Reserva> obtenerReservasPorCliente(Long clienteId) {
        return reservaRepository.findByClienteId(clienteId);
    }

    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    public List<HorarioDTO> obtenerHorariosDisponibles(Long canchaId, LocalDate fecha) {
        List<String> horariosBase = List.of(
                "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
                "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
        );

        List<Reserva> reservas = reservaRepository.findByCanchaIdAndFecha(canchaId, fecha);

        LocalDateTime ahora = LocalDateTime.now();

        return horariosBase.stream().map(hora -> {
            String horaFormateada = hora + ":00"; // para machear LocalTime si es necesario

            // Buscar si hay alguna reserva que ocupa este horario
            Reserva reservaOcupante = reservas.stream()
                    .filter(r -> r.getHoraInicio().toString().substring(0, 5).equals(hora))
                    .findFirst().orElse(null);

            if (reservaOcupante != null) {
                if (reservaOcupante.getEstado().equals("CONFIRMADA") || reservaOcupante.getEstado().equals("PAGADO") || reservaOcupante.getEstado().equals("ESPERANDO_CONFIRMACION")) {
                    return new HorarioDTO(hora, "OCUPADO", 0L);
                } else if (reservaOcupante.getEstado().equals("PENDIENTE_ADELANTO") && reservaOcupante.getFechaExpiracionBloqueo() != null) {
                    if (ahora.isBefore(reservaOcupante.getFechaExpiracionBloqueo())) {
                        long segundosRestantes = Duration.between(ahora, reservaOcupante.getFechaExpiracionBloqueo()).getSeconds();
                        return new HorarioDTO(hora, "BLOQUEADO", segundosRestantes);
                    }
                }
            }

            return new HorarioDTO(hora, "LIBRE", 0L);
        }).collect(Collectors.toList());
    }
}
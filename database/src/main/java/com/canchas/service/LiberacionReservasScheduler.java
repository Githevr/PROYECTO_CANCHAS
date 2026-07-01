package com.canchas.service;


import com.canchas.model.Reserva;
import com.canchas.repository.PagoRepository;
import com.canchas.repository.ReservaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class LiberacionReservasScheduler {

    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;

    public LiberacionReservasScheduler(ReservaRepository reservaRepository, PagoRepository pagoRepository) {
        this.reservaRepository = reservaRepository;
        this.pagoRepository = pagoRepository;
    }

    /**
     * Tarea programada en segundo plano que se ejecuta automáticamente cada minuto (en el segundo 0).
     * Verifica e inactiva las reservas no confirmadas o inasistentes transcurridos los 15 minutos de tolerancia.
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void liberarReservasVencidas() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDate hoy = ahora.toLocalDate();
        
        // El límite de tolerancia es la hora actual menos 15 minutos
        LocalTime limiteHora = ahora.toLocalTime().minusMinutes(15);

        // Buscar reservas CONFIRMADAS o PENDIENTE_ADELANTO cuyo inicio ya pasó de los 15 minutos de tolerancia
        List<Reserva> reservasExpiradas = reservaRepository.findReservasExpiradas(hoy, limiteHora);

        if (!reservasExpiradas.isEmpty()) {
            System.out.println("[Scheduler] Se encontraron " + reservasExpiradas.size() + " reservas que superaron el límite de 15 minutos de tolerancia.");
            
            for (Reserva reserva : reservasExpiradas) {
                // Cambiar estado a liberada
                reserva.setEstado("LIBERADA_POR_INASISTENCIA");
                reservaRepository.save(reserva);

                // Actualizar estado del pago a cancelado/inasistencia
                pagoRepository.findByReservaId(reserva.getId()).ifPresent(pago -> {
                    pago.setEstado("LIBERADA_POR_INASISTENCIA");
                    pagoRepository.save(pago);
                });

                System.out.println("[Scheduler] Reserva #" + reserva.getId() + " de la cancha [" 
                        + reserva.getCancha().getNombre() + "] liberada automáticamente. El adelanto queda retenido.");
            }
        }
    }
}

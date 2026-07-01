package com.canchas.service;

import com.canchas.model.Calificacion;
import com.canchas.model.Reserva;
import com.canchas.model.Cliente;
import com.canchas.repository.CalificacionRepository;
import com.canchas.repository.ReservaRepository;
import com.canchas.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;

    public CalificacionService(CalificacionRepository calificacionRepository, ReservaRepository reservaRepository, ClienteRepository clienteRepository) {
        this.calificacionRepository = calificacionRepository;
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
    }

    public Reserva obtenerReservaPendienteCalificar(Long clienteId) {
        // Obtenemos las reservas pasadas del cliente que estén CONFIRMADA o PAGADO
        LocalDateTime ahora = LocalDateTime.now();
        List<Reserva> reservas = reservaRepository.findByClienteId(clienteId);

        for (Reserva r : reservas) {
            // Check if it's past and confirmed/paid
            LocalDateTime fechaHoraReserva = LocalDateTime.of(r.getFecha(), r.getHoraInicio());
            if (fechaHoraReserva.isBefore(ahora) && (r.getEstado().equals("CONFIRMADA") || r.getEstado().equals("PAGADO"))) {
                // Validación: la cancha de esta reserva NO debe haber sido calificada por este cliente
                boolean yaCalificada = calificacionRepository.existsByClienteIdAndCanchaId(clienteId, r.getCancha().getId());
                if (!yaCalificada) {
                    return r; // Retorna la primera reserva finalizada cuya cancha aún no tiene calificación
                }
            }
        }
        return null;
    }

    public Calificacion guardarCalificacion(Long reservaId, Long clienteId, Integer puntuacion, String comentario) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (!reserva.getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("El cliente no corresponde a la reserva");
        }
        
        // Validación: solo reservas finalizadas pueden ser calificadas
        LocalDateTime fechaHoraReserva = LocalDateTime.of(reserva.getFecha(), reserva.getHoraInicio());
        if (!fechaHoraReserva.isBefore(LocalDateTime.now()) || !(reserva.getEstado().equals("CONFIRMADA") || reserva.getEstado().equals("PAGADO"))) {
             throw new RuntimeException("Solo se pueden calificar reservas pasadas y completadas.");
        }

        // Validación de negocio principal: Un cliente califica una cancha solo una vez
        if (calificacionRepository.existsByClienteIdAndCanchaId(clienteId, reserva.getCancha().getId())) {
            throw new RuntimeException("Ya calificaste esta cancha anteriormente.");
        }

        Calificacion c = new Calificacion();
        c.setReserva(reserva);
        c.setCliente(cliente);
        c.setCancha(reserva.getCancha()); // Asignamos la cancha para la restricción única
        c.setPuntuacion(puntuacion);
        c.setComentario(comentario);
        
        return calificacionRepository.save(c);
    }
}

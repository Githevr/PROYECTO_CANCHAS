package com.canchas.service;

import com.canchas.dto.ReservaRequest;
import com.canchas.model.Canchas;
import com.canchas.model.Cliente;
import com.canchas.model.Pago;
import com.canchas.model.Reserva;
import com.canchas.repository.CanchaRepository;
import com.canchas.repository.ClienteRepository;
import com.canchas.repository.PagoRepository;
import com.canchas.repository.ReservaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {


    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final CanchaRepository canchaRepository;
    private final PagoRepository pagoRepository;

    public ReservaService (
        ReservaRepository reservaRepository,
        ClienteRepository clienteRepository,
        CanchaRepository canchaRepository,
        PagoRepository pagoRepository
    ){
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.canchaRepository = canchaRepository;
        this.pagoRepository = pagoRepository;
    }

    @Transactional
    public Reserva crearReserva(ReservaRequest request) {

        boolean ocupada =
                reservaRepository
                        .existsByCanchaIdAndFechaAndHoraInicio(
                                request.getCanchaId(),
                                request.getFecha(),
                                request.getHoraInicio()
                        );

        if (ocupada) {
            throw new RuntimeException(
                    "La cancha ya se encuentra reservada en ese horario"
            );
        }

        Cliente cliente = clienteRepository
                .findById(request.getClienteId())
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));

        Canchas cancha = canchaRepository
                .findById(request.getCanchaId())
                .orElseThrow(() ->
                        new RuntimeException("Cancha no encontrada"));

        Reserva reserva = new Reserva();

        reserva.setCliente(cliente);
        reserva.setCancha(cancha);

        reserva.setFecha(request.getFecha());

        reserva.setHoraInicio(request.getHoraInicio());

        // Si la reserva es de 1 hora
        reserva.setHoraFin(
                request.getHoraInicio().plusHours(1)
        );

        reserva.setEstado("CONFIRMADA");

        reserva = reservaRepository.save(reserva);

        Pago pago = new Pago();

        pago.setReserva(reserva);
        pago.setMonto(request.getMonto());
        pago.setMetodoPago(request.getMetodoPago());
        pago.setFechaPago(LocalDateTime.now());
        pago.setEstado("PAGADO");

        pagoRepository.save(pago);

        return reserva;
    }
    

    public List<String> obtenerHorariosDisponibles(
            Long canchaId,
            LocalDate fecha
    ) {

        List<String> horariosBase = List.of(
                "09:00",
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00",
                "19:00",
                "20:00",
                "21:00"
        );

        List<Reserva> reservas =
                reservaRepository.findByCanchaIdAndFecha(
                        canchaId,
                        fecha
                );

        List<String> horariosOcupados =
                reservas.stream()
                        .map(reserva ->
                                reserva.getHoraInicio()
                                        .toString()
                                        .substring(0, 5)
                        )
                        .toList();

        return horariosBase.stream()
                .filter(hora ->
                        !horariosOcupados.contains(hora)
                )
                .toList();
    }
    public List<Reserva> obtenerReservasPorCliente(
        Long clienteId
) {

    return reservaRepository.findByClienteId(
            clienteId
    );

}
public Reserva obtenerPorId(Long id) {

    return reservaRepository
            .findById(id)
            .orElseThrow(
                    () -> new RuntimeException(
                            "Reserva no encontrada"
                    )
            );

}
}
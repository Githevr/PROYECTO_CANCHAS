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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private CanchaRepository canchaRepository;

    @Autowired
    private PagoRepository pagoRepository;

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
                    "La cancha ya se encuentra reservada"
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
        reserva.setHoraFin(request.getHoraFin());
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
}
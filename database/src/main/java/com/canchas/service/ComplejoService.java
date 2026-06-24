package com.canchas.service;

import com.canchas.model.Canchas;
import com.canchas.model.Cliente;
import com.canchas.model.ComplejoDeportivo;
import com.canchas.repository.CanchaRepository;
import com.canchas.repository.ClienteRepository;
import com.canchas.repository.ComplejoDeportivoRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
public class ComplejoService {

    private final ComplejoDeportivoRepository complejoRepository;
    private final CanchaRepository canchaRepository;
    private final ClienteRepository clienteRepository;

    public ComplejoService(
            ComplejoDeportivoRepository complejoRepository,
            CanchaRepository canchaRepository,
            ClienteRepository clienteRepository
    ) {
        this.complejoRepository = complejoRepository;
        this.canchaRepository = canchaRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public ComplejoDeportivo crearComplejo(ComplejoDeportivo complejo, Long propietarioId) {
        Cliente propietario = clienteRepository.findById(propietarioId)
                .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));

        if (!"PROPIETARIO".equals(propietario.getRol())) {
            throw new RuntimeException("El usuario seleccionado no tiene el rol de PROPIETARIO.");
        }

        complejo.setPropietario(propietario);
        return complejoRepository.save(complejo);
    }

    @Transactional
    public Canchas agregarCanchaAComplejo(Long complejoId, Canchas cancha) {
        ComplejoDeportivo complejo = complejoRepository.findById(complejoId)
                .orElseThrow(() -> new RuntimeException("Complejo deportivo no encontrado"));

        cancha.setComplejo(complejo);
        
        // Sincronizar ubicación de la cancha con la del complejo por compatibilidad
        cancha.setUbicacion(complejo.getDireccion() + ", " + complejo.getCiudad());
        
        return canchaRepository.save(cancha);
    }

    public List<ComplejoDeportivo> obtenerComplejosPorPropietario(Long propietarioId) {
        return complejoRepository.findByPropietarioId(propietarioId);
    }

    public List<ComplejoDeportivo> obtenerComplejosPorCiudad(String ciudad, boolean soloActivos) {
        if (soloActivos) {
            return complejoRepository.findComplejosActivosPorCiudad(ciudad);
        } else {
            return complejoRepository.findByCiudadIgnoreCase(ciudad);
        }
    }

    public ComplejoDeportivo obtenerComplejoPorId(Long id) {
        return complejoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complejo deportivo no encontrado"));
    }

    public List<Canchas> obtenerCanchasPorComplejo(Long complejoId) {
        return canchaRepository.findByComplejoId(complejoId);
    }
}

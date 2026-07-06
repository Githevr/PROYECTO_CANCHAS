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

    public void eliminarCancha(Long canchaId) {
        canchaRepository.deleteById(canchaId);
    }

    @Transactional
    public ComplejoDeportivo actualizarKybComplejo(Long id, ComplejoDeportivo nuevosDatos) {
        ComplejoDeportivo existente = complejoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complejo no encontrado"));

        if (!"REJECTED".equals(existente.getEstadoVerificacion())) {
            throw new RuntimeException("Solo se pueden corregir documentos de complejos rechazados.");
        }

        // Eliminar archivos físicos viejos
        eliminarArchivoFisico(existente.getUrlLicencia());
        eliminarArchivoFisico(existente.getUrlFichaRuc());
        eliminarArchivoFisico(existente.getUrlDniRepresentante());
        eliminarArchivoFisico(existente.getUrlDniReverso());

        // Actualizar datos
        existente.setRuc(nuevosDatos.getRuc());
        existente.setRazonSocial(nuevosDatos.getRazonSocial());
        existente.setUrlLicencia(nuevosDatos.getUrlLicencia());
        existente.setUrlFichaRuc(nuevosDatos.getUrlFichaRuc());
        existente.setUrlDniRepresentante(nuevosDatos.getUrlDniRepresentante());
        existente.setUrlDniReverso(nuevosDatos.getUrlDniReverso());
        
        // Volver a poner en revisión
        existente.setEstadoVerificacion("PENDING_VERIFICATION");

        return complejoRepository.save(existente);
    }

    private void eliminarArchivoFisico(String url) {
        if (url != null && url.startsWith("/uploads/kyb/")) {
            String nombreArchivo = url.substring("/uploads/kyb/".length());
            try {
                java.nio.file.Path ruta = java.nio.file.Paths.get("uploads/kyb/" + nombreArchivo);
                java.io.File archivo = ruta.toFile();
                if (archivo.exists()) {
                    archivo.delete();
                }
            } catch (Exception e) {
                System.err.println("No se pudo eliminar el archivo viejo: " + nombreArchivo);
            }
        }
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

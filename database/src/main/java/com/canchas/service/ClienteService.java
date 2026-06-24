package com.canchas.service;

import com.canchas.dto.ConfirmarCorreoRequest;
import com.canchas.dto.LoginRequest;
import com.canchas.dto.LoginResponse;
import com.canchas.model.Cliente;
import com.canchas.repository.ClienteRepository;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final EmailService emailService;

    public ClienteService(ClienteRepository clienteRepository, EmailService emailService) {
        this.clienteRepository = clienteRepository;
        this.emailService = emailService;
    }

    public Cliente guardar(Cliente cliente) {
        // Regla de Negocio 1: Validar que el correo no exista previamente
        if (clienteRepository.findByCorreo(cliente.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente registrado con ese correo");
        }

        // Regla de Negocio 2: Generar código de confirmación de 6 dígitos
        Random random = new Random();
        int codigoGen = 100000 + random.nextInt(900000);
        String codigo = String.valueOf(codigoGen);

        // Regla de Negocio 3: Establecer estado inicial sin confirmar
        cliente.setConfirmado(false);
        cliente.setCodigoConfirmacion(codigo);

        // Guardamos el cliente primero para asegurar que se persista correctamente
        Cliente nuevoCliente = clienteRepository.save(cliente);

        // Regla de Negocio 4: Envío REAL del correo mediante servidor SMTP externo
        emailService.enviarCodigoConfirmacion(nuevoCliente.getCorreo(), nuevoCliente.getNombre(), codigo);

        return nuevoCliente;
    }

    public Map<String, Object> confirmarCorreo(ConfirmarCorreoRequest request) {
        Cliente cliente = clienteRepository
                .findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con el correo: " + request.getCorreo()));

        if (Boolean.TRUE.equals(cliente.getConfirmado())) {
            throw new RuntimeException("El correo ya se encuentra confirmado.");
        }

        if (!cliente.getCodigoConfirmacion().equals(request.getCodigo())) {
            throw new RuntimeException("El código de confirmación es incorrecto.");
        }

        cliente.setConfirmado(true);
        clienteRepository.save(cliente);

        Map<String, Object> response = new HashMap<>();
        response.put("exito", true);
        response.put("mensaje", "¡Correo confirmado exitosamente! Ya puedes iniciar sesión.");
        return response;
    }

    public LoginResponse login(LoginRequest request) {

        Cliente cliente = clienteRepository
                .findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Correo no encontrado"));

        // Regla de Negocio 5: Validar que el correo esté confirmado antes de loguear
        if (cliente.getConfirmado() == null || !cliente.getConfirmado()) {
            throw new RuntimeException("Debe confirmar su correo electrónico antes de iniciar sesión.");
        }

        if (!cliente.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return new LoginResponse(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getCorreo(),
                "Login exitoso"
        );
    }
}
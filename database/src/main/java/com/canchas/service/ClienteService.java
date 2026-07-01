package com.canchas.service;

import com.canchas.dto.ConfirmarCorreoRequest;
import com.canchas.dto.LoginRequest;
import com.canchas.dto.LoginResponse;
import com.canchas.model.Cliente;
import com.canchas.repository.ClienteRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import com.canchas.security.JwtUtil;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public ClienteService(ClienteRepository clienteRepository, EmailService emailService, 
                          AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.clienteRepository = clienteRepository;
        this.emailService = emailService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
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

        // Regla de Negocio 3: Establecer estado inicial sin confirmar, rol, saldo inicial y fecha de código
        cliente.setConfirmado(false);
        cliente.setCodigoConfirmacion(codigo);
        cliente.setFechaGeneracionCodigo(LocalDateTime.now());
        
        // Si el rol no está asignado o es inválido, por seguridad se asigna JUGADOR
        if (cliente.getRol() == null || (!cliente.getRol().equals("JUGADOR") && !cliente.getRol().equals("PROPIETARIO"))) {
            cliente.setRol("JUGADOR");
        }
        
        // El saldo inicial de créditos es siempre 0.00 en la billetera
        cliente.setCreditos(BigDecimal.ZERO);

        // Guardamos el cliente
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

        // Regla de Negocio: Validar expiración de 10 minutos para el código OTP
        if (cliente.getFechaGeneracionCodigo() == null || 
            LocalDateTime.now().isAfter(cliente.getFechaGeneracionCodigo().plusMinutes(10))) {
            throw new RuntimeException("El código de confirmación ha expirado (límite de 10 minutos). Por favor, solicita uno nuevo.");
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

        // Usar AuthenticationManager de Spring Security para validar credenciales
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getPassword())
            );
        } catch (Exception e) {
            throw new RuntimeException("Contraseña incorrecta o credenciales inválidas");
        }

        // Generar JWT
        String token = jwtUtil.generarToken(cliente.getCorreo(), cliente.getRol());

        return new LoginResponse(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getCorreo(),
                "Login exitoso",
                cliente.getRol(),
                cliente.getCreditos(),
                token
        );
    }

    // Regla de Negocio: Regenerar y reenviar un nuevo código OTP por correo
    public Map<String, Object> reenviarCodigo(String correo) {
        Cliente cliente = clienteRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con el correo: " + correo));

        if (Boolean.TRUE.equals(cliente.getConfirmado())) {
            throw new RuntimeException("Este correo electrónico ya se encuentra confirmado y verificado.");
        }

        // Generar un nuevo código aleatorio de 6 dígitos
        Random random = new Random();
        int codigoGen = 100000 + random.nextInt(900000);
        String codigo = String.valueOf(codigoGen);

        // Actualizar el código y renovar el tiempo de expiración
        cliente.setCodigoConfirmacion(codigo);
        cliente.setFechaGeneracionCodigo(LocalDateTime.now());
        clienteRepository.save(cliente);

        // Enviar el nuevo correo mediante el servidor SMTP
        emailService.enviarCodigoConfirmacion(cliente.getCorreo(), cliente.getNombre(), codigo);

        Map<String, Object> response = new HashMap<>();
        response.put("exito", true);
        response.put("mensaje", "Se ha enviado un nuevo código de confirmación de 6 dígitos a tu bandeja de correo.");
        return response;
    }
}
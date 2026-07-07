package com.canchas.controller;

import com.canchas.dto.ConfirmarCorreoRequest;
import com.canchas.dto.LoginRequest;
import com.canchas.dto.LoginResponse;
import com.canchas.model.Cliente;
import com.canchas.repository.ClienteRepository;
import com.canchas.service.ClienteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clientes")
@CrossOrigin("*")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;

    public ClienteController(
            ClienteRepository clienteRepository,
            ClienteService clienteService
    ) {
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    @GetMapping("/{id}")
    public Cliente obtenerPorId(
            @PathVariable Long id
    ) {
        return clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));
    }

    @PostMapping
    public ResponseEntity<?> guardar(
            @RequestBody Cliente cliente
    ) {
        try {
            Cliente nuevoCliente = clienteService.guardar(cliente);
            return ResponseEntity.ok(nuevoCliente);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarCorreo(
            @RequestBody ConfirmarCorreoRequest request
    ) {
        try {
            Map<String, Object> response = clienteService.confirmarCorreo(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {
        try {
            LoginResponse response = clienteService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Endpoint para regenerar y reenviar el código OTP por correo
    @PostMapping("/reenviar-codigo")
    public ResponseEntity<?> reenviarCodigo(@RequestParam String correo) {
        try {
            Map<String, Object> response = clienteService.reenviarCodigo(correo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}/reservas-perdidas")
    public ResponseEntity<?> obtenerReservasPerdidas(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente no encontrado");
        }
        Map<String, Integer> response = new HashMap<>();
        response.put("reservasPerdidas", cliente.getReservasPerdidas() != null ? cliente.getReservasPerdidas() : 0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reset-reservas-perdidas")
    public ResponseEntity<?> resetReservasPerdidas(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente no encontrado");
        }
        cliente.setReservasPerdidas(0);
        clienteRepository.save(cliente);
        return ResponseEntity.ok("Contador reiniciado");
    }
}
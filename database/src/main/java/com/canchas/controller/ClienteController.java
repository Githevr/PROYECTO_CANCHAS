package com.canchas.controller;

import com.canchas.dto.LoginRequest;
import com.canchas.dto.LoginResponse;
import com.canchas.model.Cliente;
import com.canchas.repository.ClienteRepository;
import com.canchas.service.ClienteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
@CrossOrigin("*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ClienteService clienteService;

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
    public Cliente guardar(
            @RequestBody Cliente cliente
    ) {
        return clienteRepository.save(cliente);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request
    ) {
        return clienteService.login(request);
    }
    
}
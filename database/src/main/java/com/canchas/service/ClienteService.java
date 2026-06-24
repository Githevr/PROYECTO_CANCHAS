package com.canchas.service;

import com.canchas.dto.LoginRequest;
import com.canchas.dto.LoginResponse;
import com.canchas.model.Cliente;
import com.canchas.repository.ClienteRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public LoginResponse login(LoginRequest request) {

        Cliente cliente = clienteRepository
                .findByCorreo(request.getCorreo())
                .orElseThrow(() ->
                        new RuntimeException("Correo no encontrado"));

        if (!cliente.getPassword()
                .equals(request.getPassword())) {

            throw new RuntimeException(
                    "Contraseña incorrecta"
            );
        }

        return new LoginResponse(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getCorreo(),
                "Login exitoso"
        );
    }
}
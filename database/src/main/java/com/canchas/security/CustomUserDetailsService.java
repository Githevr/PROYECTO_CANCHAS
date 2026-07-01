package com.canchas.security;

import com.canchas.model.Cliente;
import com.canchas.repository.ClienteRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final ClienteRepository clienteRepository;

    public CustomUserDetailsService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Cliente cliente = clienteRepository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + username));

        // Por seguridad, usar el rol en mayúsculas
        String rolNormalizado = cliente.getRol() != null ? cliente.getRol().toUpperCase() : "JUGADOR";

        return new User(
                cliente.getCorreo(),
                cliente.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(rolNormalizado))
        );
    }
}

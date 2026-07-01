package com.canchas.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Se recomienda una clave secreta fuerte de al menos 256 bits (32 caracteres)
    private static final String SECRET = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890CanchasAppSecreta2026!";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());
    
    // El token durará 24 horas
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    public String generarToken(String correo, String rol) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", rol);
        
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(correo)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extraerCorreo(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public String extraerRol(String token) {
        return extraerTodosLosClaims(token).get("rol", String.class);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validarToken(String token, String correoUsuario) {
        final String correo = extraerCorreo(token);
        return (correo.equals(correoUsuario) && !tokenExpirado(token));
    }

    private boolean tokenExpirado(String token) {
        return extraerClaim(token, Claims::getExpiration).before(new Date());
    }
}

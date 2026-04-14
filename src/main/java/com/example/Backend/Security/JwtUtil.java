package com.example.Backend.Security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Map;

/** Clase de utilidad para generar tokens JWT.
 */
public class JwtUtil {

    // Esto genera una clave secreta aleatoria cada vez que se inicia la aplicación.
    private static final Key KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    /**
     * Genera un token JWT con los claims proporcionados y el sujeto (username).
     *
     * @param claims Mapa de claims personalizados a incluir en el token.
     * @param subject El sujeto del token, típicamente el username del usuario.
     * @return Un token JWT firmado.
     */
    public static String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(KEY)
                .compact();
    }
}

package com.example.Backend.DTO;

public record LoginResponse(
        String token,
        String email,
        String nombre,
        String apellido1,
        String apellido2,
        String rol,
        String rolId,
        Long id
) {
}
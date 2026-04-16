package com.example.Backend.DTO;

public record UsuarioCreateRequest(
        String dni,
        String nombre,
        String apellido1,
        String apellido2,
        String email,
        String rol
) {
}

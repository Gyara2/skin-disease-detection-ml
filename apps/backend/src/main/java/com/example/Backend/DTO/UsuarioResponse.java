package com.example.Backend.DTO;

import com.example.Backend.Rol.Rol;

public record UsuarioResponse(

        Long id,
        String dni,
        String nombre,
        String apellido1,
        String apellido2,
        String email,
        Integer edad,
        Rol.TipoRol rol
) {
}

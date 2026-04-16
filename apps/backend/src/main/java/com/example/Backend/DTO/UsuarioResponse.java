package com.example.Backend.DTO;

import com.example.Backend.Rol.Rol;
import java.time.LocalDateTime;

public record UsuarioResponse(

        String id,
        String dni,
        String nombre,
        String apellido1,
        String apellido2,
        String email,
        Rol.TipoRol rol,
        String rolId,
        LocalDateTime creado,
        LocalDateTime actualizado
) {
}

package com.example.Backend.DTO;

import com.example.Backend.Rol.Rol;

/** * DTO para representar la información de un usuario que se enviará como respuesta a las solicitudes relacionadas con usuarios.
 *
 * @param id         Identificador único del usuario.
 * @param dni        Documento Nacional de Identidad del usuario.
 * @param nombre      Nombre del usuario.
 * @param apellido1   Primer apellido del usuario.
 * @param apellido2   Segundo apellido del usuario.
 * @param email       Correo electrónico del usuario.
 * @param edad        Edad del usuario.
 * @param rol         Rol del usuario (ADMIN, DOCTOR, PACIENTE).
 */
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

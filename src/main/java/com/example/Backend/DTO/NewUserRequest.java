package com.example.Backend.DTO;

/** * DTO para representar la información necesaria para crear un nuevo usuario.
 *
 * @param dni        Documento Nacional de Identidad del usuario.
 * @param nombre      Nombre del usuario.
 * @param apellido1   Primer apellido del usuario.
 * @param apellido2   Segundo apellido del usuario.
 * @param password    Contraseña del usuario.
 * @param email       Correo electrónico del usuario.
 * @param edad        Edad del usuario.
 * @param sexo        Sexo del usuario ("M" para masculino, "F" para femenino).
 * @param rol         Rol del usuario ("ADMIN", "DOCTOR", "PACIENTE").
 */
public record NewUserRequest(
         String dni,
         String nombre,
         String apellido1,
         String apellido2,
         String password,
         String email,
         Integer edad,
         String sexo,
         String rol
        ) {}

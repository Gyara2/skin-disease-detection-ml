package com.example.Backend.DTO;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** * DTO para representar la información necesaria para crear un nuevo caso.
 *
 * @param emailPaciente   Correo electrónico del paciente asociado al caso.
 * @param emailEspecialista Correo electrónico del especialista asociado al caso.
 * @param imagenes        Lista de imágenes (archivos) relacionadas con el caso.
 */
public record NewCasoRequest(
        String emailPaciente,
        String emailEspecialista,
        List<MultipartFile> imagenes
){}

package com.example.Backend.DTO;
import java.util.Map;

public record NewCasoResponse(
        Long id_caso,
        Long id_imagen,
        String nombreImagen,
        Long id_paciente,
        String nombrePaciente,
        Map<String, Double> clasificacion_dermatologica
) {
}

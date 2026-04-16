package com.example.Backend.DTO;

import java.time.LocalDateTime;

public record CasoListItemResponse(
        String id,
        String paciente_id,
        String paciente_nombre,
        String especialista_id,
        String especialista_nombre,
        String estado,
        Integer diagnosticos_count,
        Integer imagenes_count,
        LocalDateTime creado,
        LocalDateTime actualizado
) {
}

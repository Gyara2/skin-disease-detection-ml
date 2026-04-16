package com.example.Backend.DTO;

import java.time.LocalDateTime;

public record CasoDetalleDiagnosticoResponse(
        String diagnostico,
        String nota,
        LocalDateTime creado,
        LocalDateTime actualizado,
        String especialista_id,
        String especialista_nombre
) {
}


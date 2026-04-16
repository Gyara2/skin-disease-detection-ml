package com.example.Backend.DTO;

import java.time.LocalDateTime;
import java.util.Map;

public record CasoDetallePrediccionResponse(
        String id,
        String modelo_version,
        Map<String, Double> resultado,
        LocalDateTime creado
) {
}

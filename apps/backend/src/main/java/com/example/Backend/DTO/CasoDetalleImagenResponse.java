package com.example.Backend.DTO;

import java.time.LocalDateTime;

public record CasoDetalleImagenResponse(
        String id,
        String nombre_archivo,
        String mime_type,
        Integer size,
        LocalDateTime uploaded_at,
        String src,
        CasoDetallePrediccionResponse prediccion
) {
}

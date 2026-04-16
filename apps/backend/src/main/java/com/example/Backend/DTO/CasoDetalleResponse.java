package com.example.Backend.DTO;

import java.time.LocalDateTime;
import java.util.List;

public record CasoDetalleResponse(
        String id,
        String estado,
        LocalDateTime creado,
        LocalDateTime actualizado,
        CasoDetalleUsuarioResponse paciente,
        CasoDetalleUsuarioResponse especialista,
        CasoDetalleDiagnosticoResponse diagnostico_especialista,
        List<CasoDetalleImagenResponse> imagenes
) {
}

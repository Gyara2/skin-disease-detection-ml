package com.example.Backend.DTO;

import java.util.List;

public record CasoUpsertRequest(
        String id,
        String paciente,
        String especialista,
        List<String> imagenes
) {
}

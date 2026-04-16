package com.example.Backend.DTO;

public record CasoDiagnosticoRequest(
        String especialistaId,
        String diagnostico,
        String nota
) {
}


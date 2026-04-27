package com.example.Backend.DTO;

public record LoginRequest(
        String email,
        String password
) {
}
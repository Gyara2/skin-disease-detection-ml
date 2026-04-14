package com.example.Backend.DTO;

import java.util.UUID;

public record RequestData(
        String image_base64,
        UUID id_imagen
) {}

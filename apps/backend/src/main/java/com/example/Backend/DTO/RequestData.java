package com.example.Backend.DTO;


import com.fasterxml.jackson.annotation.JsonProperty;

public record RequestData(
        // Con esto nos aseguramos que Spring no transforma los nombres al enviar la peticion
        @JsonProperty("image_base64")
        String image_base64,
        @JsonProperty("id_imagen")
        Long id_imagen
) {}

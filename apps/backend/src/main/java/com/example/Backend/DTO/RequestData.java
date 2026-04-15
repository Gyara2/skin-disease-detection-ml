package com.example.Backend.DTO;


import com.fasterxml.jackson.annotation.JsonProperty;

/** * DTO para representar la información de una solicitud que contiene una imagen en formato Base64 y un identificador de imagen.
 *
 * @param image_base64 Cadena que representa la imagen codificada en Base64.
 * @param id_imagen    Identificador único de la imagen.
 */
public record RequestData(
        // Con esto nos aseguramos que Spring no transforma los nombres al enviar la peticion
        @JsonProperty("image_base64")
        String image_base64,
        @JsonProperty("id_imagen")
        Long id_imagen
) {}

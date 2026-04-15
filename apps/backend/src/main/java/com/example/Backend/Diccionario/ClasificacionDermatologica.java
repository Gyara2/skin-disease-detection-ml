package com.example.Backend.Diccionario;

import java.util.UUID;

/** * Registro que representa la clasificación dermatológica de una imagen.
 * Contiene el ID de la imagen y las probabilidades asociadas a cada categoría dermatológica.
 */
public record ClasificacionDermatologica(
        Long id_imagen,
        Double akiec, // Queratosis actínica
        Double bcc, // Carcinoma de células basales
        Double bkl, // Lesiones benignas de tipo queratosis
        Double mel, // Melanoma
        Double nv, // Nevus melanocíticos
        Double vasc, // Lesiones vasculares
        Double df // Dermatofibroma
) {}

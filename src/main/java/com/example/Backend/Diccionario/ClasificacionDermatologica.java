package com.example.Backend;

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

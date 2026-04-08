package com.example.Backend.Diccionario;

/**
 * Enum que representa las variables utilizadas en el modelo de clasificación de lesiones cutáneas.
 * Cada constante del enum corresponde a una categoría de lesión cutánea, con su descripción asociada.
 * Estas variables se utilizan para identificar y clasificar diferentes tipos de lesiones cutáneas en el sistema.
 */
public enum Variables {
    akiec("Queratosis actínica"),
    bcc("Carcinoma de células basales"),
    bkl("Lesiones benignas de tipo queratosis"),
    df("Dermatofibroma"),
    mel("Melanoma"),
    nv("Nevus melanocíticos"),
    vasc("Lesiones vasculares");

    Variables(String s) {

    }
}

package com.example.Backend.DTO;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;

/** DTO para representar la información de un caso.
 *
 * @param casoId             Identificador único del caso.
 * @param estado              Estado actual del caso ("PENDIENTE", "VERIFICADO").
 * @param nombrePaciente      Nombre del paciente asociado al caso.
 * @param apellido1Paciente   Primer apellido del paciente.
 * @param apellido2Paciente   Segundo apellido del paciente.
 * @param ultimaActualizacion Fecha y hora de la última actualización del caso.
 * @param resultadoModelo     Resultado generado por el modelo de IA para el caso.
 * @param resultadoModelo     Mapa que contiene las predicciones del modelo de IA,
 *                            donde la clave es el nombre de la clase y el valor es la probabilidad asociada a esa clase.
 */
public record CasoResponse(
        UUID casoId,
        String estado,
        String nombrePaciente,
        String apellido1Paciente,
        String apellido2Paciente,
        LocalDateTime ultimaActualizacion,
        Map<String, Double> resultadoModelo
) {
}

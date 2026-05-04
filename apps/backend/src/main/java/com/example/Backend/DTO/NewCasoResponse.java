package com.example.Backend.DTO;
import java.util.Map;

/** * DTO para representar la información de un nuevo caso creado.
 *
 * @param id_caso                    Identificador único del caso.
 * @param id_imagen                   Identificador único de la imagen asociada al caso.
 * @param nombreImagen                Nombre de la imagen asociada al caso.
 * @param id_paciente                 Identificador único del paciente asociado al caso.
 * @param nombrePaciente              Nombre del paciente asociado al caso.
 * @param clasificacion_dermatologica Mapa que contiene las predicciones del modelo de IA,
 *                                   donde la clave es el nombre de la clase y el valor es la probabilidad asociada a esa clase.
 */
public record NewCasoResponse(
        Long id_caso,
        Long id_imagen,
        String nombreImagen,
        Long id_paciente,
        String nombrePaciente,
        Map<String, Double> clasificacion_dermatologica
) {
}

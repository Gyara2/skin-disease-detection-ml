package com.example.Backend.Prediccion;

import org.springframework.stereotype.Service;

/** Servicio para manejar la lógica de negocio relacionada con las Predicciones.
 * Proporciona métodos para guardar nuevas predicciones y, potencialmente, para
 * realizar otras operaciones relacionadas con las predicciones en el futuro.
 */
@Service
public class PrediccionService {
    private final PrediccionRepository prediccionRepository;

    public PrediccionService(PrediccionRepository prediccionRepository) {
        this.prediccionRepository = prediccionRepository;
    }

    public void guardarPrediccion (Prediccion prediccion) {
        prediccionRepository.save(prediccion);
    }

    public Prediccion savePrediccion(Prediccion prediccion) {
        return prediccionRepository.save(prediccion);
    }
}

package com.example.Backend.Prediccion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/** Repositorio para la entidad Prediccion, que extiende JpaRepository para proporcionar
 * métodos CRUD y de consulta personalizados si es necesario.
 */
public interface PrediccionRepository extends JpaRepository <Prediccion, UUID> {

}

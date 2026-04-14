package com.example.Backend.Imagen;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

/** Repositorio para la entidad Imagen, que extiende JpaRepository para proporcionar
 * métodos CRUD y consultas personalizadas para la gestión de imágenes en la base de datos.
 */
public interface ImagenRepository extends JpaRepository<Imagen, UUID> {

}

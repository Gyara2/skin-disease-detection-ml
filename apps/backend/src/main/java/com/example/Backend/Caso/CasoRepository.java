package com.example.Backend.Caso;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CasoRepository extends JpaRepository<Caso, Long> {

    @EntityGraph(attributePaths = {"paciente", "especialista", "imagenes", "imagenes.prediccion"})
    @Query("SELECT c FROM Caso c ORDER BY c.creado DESC")
    List<Caso> findAllWithRelationsOrderByCreadoDesc();

    @EntityGraph(attributePaths = {"paciente", "especialista", "imagenes", "imagenes.prediccion"})
    @Query("SELECT c FROM Caso c WHERE c.paciente.email = :email ORDER BY c.creado DESC")
    List<Caso> findAllByPacienteEmailWithRelationsOrderByCreadoDesc(String email);

    @EntityGraph(attributePaths = {"paciente", "especialista", "imagenes", "imagenes.prediccion"})
    @Query("SELECT c FROM Caso c WHERE c.especialista.email = :email ORDER BY c.creado DESC")
    List<Caso> findAllByEspecialistaEmailWithRelationsOrderByCreadoDesc(String email);

    @EntityGraph(attributePaths = {"paciente", "especialista", "imagenes", "imagenes.prediccion"})
    @Query("SELECT c FROM Caso c WHERE c.casoId = :id")
    Optional<Caso> findByIdWithRelations(Long id);
}

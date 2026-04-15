package com.example.Backend.Caso;

import com.example.Backend.DTO.CasoResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

/** Repositorio para la entidad Caso, que extiende JpaRepository para proporcionar operaciones CRUD.
 * Además, define consultas personalizadas para obtener casos por email de especialista y paciente.
 */
public interface CasoRepository extends JpaRepository<Caso, UUID> {

    @Query("""
        SELECT new com.example.Backend.DTO.CasoResponse(
            c.casoId,
            c.estado,
            c.paciente.nombre,
            c.paciente.apellido1,
            c.paciente.apellido2,
            c.actualizado,
            p.resultado
        ) 
        FROM Caso c 
        JOIN c.paciente pac
        LEFT JOIN c.imagenes i
        LEFT JOIN i.prediccion p 
        WHERE c.especialista.email = :email 
        AND c.estado = 'PENDIENTE'
    """)
    List<CasoResponse> getAllCasosByEspecialistaEmail(String email);

    @Query("""
        SELECT new com.example.Backend.DTO.CasoResponse(
            c.casoId,
            c.estado,
            c.paciente.nombre,
            c.paciente.apellido1,
            c.paciente.apellido2,
            c.actualizado,
            p.resultado
        ) 
        FROM Caso c 
        JOIN c.paciente pac
        LEFT JOIN c.imagenes i
        LEFT JOIN i.prediccion p
        WHERE pac.email = :email
    """)
    List<CasoResponse> getAllCasosByPacienteEmail(String email);
}

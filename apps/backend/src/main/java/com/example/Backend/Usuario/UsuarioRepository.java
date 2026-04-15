package com.example.Backend.Usuario;

import com.example.Backend.DTO.UsuarioResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/** Repositorio para la entidad Usuario, que extiende JpaRepository para proporcionar operaciones CRUD.
 * Además, define un método personalizado para encontrar un usuario por su email.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
        Usuario findByEmail(String email);

        @Query("""
                SELECT new com.example.Backend.DTO.UsuarioResponse(
                    u.usuarioID,
                    u.dni,
                    u.nombre,
                    u.apellido1,
                    u.apellido2,
                    u.email,
                    u.edad,
                    u.rol.nombre
                )
                FROM Usuario u
        """)
        List<UsuarioResponse> findAllUsuarios();
}

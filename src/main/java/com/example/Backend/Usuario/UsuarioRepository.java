package com.example.Backend.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;

/** Repositorio para la entidad Usuario, que extiende JpaRepository para proporcionar operaciones CRUD.
 * Además, define un método personalizado para encontrar un usuario por su email.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
        Usuario findByEmail(String email);
}

package com.example.Backend.Rol;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RolRepository extends JpaRepository<Rol, UUID> {
    Rol findByNombre(Rol.TipoRol nombre);
    boolean existsByNombre(Rol.TipoRol nombre);

}

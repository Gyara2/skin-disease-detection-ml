package com.example.Backend.Permiso;

import com.example.Backend.Rol.Rol;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad que representa un Permiso en el sistema.
 * Un Permiso define una acción específica que puede ser asignada a uno o más Roles.
 */
@Entity
@Table(name = "permiso")
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="permiso_id")
    private Long permisoId;

    @Column(nullable = false, unique = true)
    private String nombre;

    // Relación inversa con Rol
    @ManyToMany(mappedBy = "permisos")
    private Set<Rol> roles = new HashSet<>();

}

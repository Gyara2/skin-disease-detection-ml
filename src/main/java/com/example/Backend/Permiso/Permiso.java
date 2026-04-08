package com.example.Backend.Permiso;

import com.example.Backend.Rol.Rol;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "permiso")
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_permiso")
    private UUID id_permiso;

    @Column(nullable = false, unique = true)
    private String nombre;

    // Relación inversa con Rol
    @ManyToMany(mappedBy = "permisos")
    private Set<Rol> roles = new HashSet<>();

}

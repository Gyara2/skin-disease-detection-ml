package com.example.Backend.Rol;

import com.example.Backend.Permiso.Permiso;
import com.example.Backend.Usuario.Usuario;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "rol")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_rol")
    private UUID idRol;

    @Enumerated(EnumType.STRING) // Fuerza a que se guarde 'ADMIN' en lugar de 2
    @Column(nullable = false, unique = true)
    private TipoRol nombre;

    public enum TipoRol {
        ADMIN, ESPECIALISTA, PACIENTE
    }

    // EAGER es lo opuesto a LAZY, carga todas las entidades relacionadas al cargar un rol,
    // en este caso los permisos
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "rol_permiso", // Nombre de la tabla intermedia
            joinColumns = @JoinColumn(name = "rol_id"),
            inverseJoinColumns = @JoinColumn(name = "permiso_id")
    )
    private Set<Permiso> permisos = new HashSet<>();


    @OneToMany(mappedBy = "rol")
    private List<Usuario> usuarios;


    public UUID getId() {
        return idRol;
    }

    public void setId(UUID id) {
        this.idRol = id;
    }

    public TipoRol getNombre() {
        return nombre;
    }

    public void setNombre(TipoRol nombre) {
        this.nombre = nombre;
    }

    public Set<Permiso> getPermisos() {
        return permisos;
    }

    public void setPermisos(Set<Permiso> permisos) {
        this.permisos = permisos;
    }

    public List<Usuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<Usuario> usuarios) {
        this.usuarios = usuarios;
    }

    public void addUsser(Usuario usuario) {
        if(!usuarios.contains(usuario)) {
            usuarios.add(usuario);
        }
    }
}

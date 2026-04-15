package com.example.Backend.Usuario;

import com.example.Backend.Rol.Rol;
import jakarta.persistence.*;
import org.springframework.context.annotation.Primary;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.UUID;

/** * Entidad que representa a un usuario en el sistema. Incluye campos para el DNI, nombre, apellidos, edad, sexo, email, contraseña y rol.
 * Además, tiene campos para la fecha de creación y actualización del usuario.
 */
@Entity
@Table(name = "usuario") // Para que el nombre coincida con el de la BBDD
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="usuarioId")
    private UUID usuarioID;
    @Column(unique = true, nullable = false) // Esto asegura que el DNI sea único y no nulo en la base de datos
    private String dni;
    private String nombre;
    private String apellido1;
    private String apellido2;

    private Integer edad;

    @Column(unique = true, nullable = false) // Esto asegura que el email sea único y no nulo en la base de datos
    private String email;

    private String password;

    // LAZY carga unicamente el rol y no las demas "entidades" relacionadas
    // esto evita bucles infinitos al cargar un usuario, ya que el rol no cargará a su vez los usuarios relacionados
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_id", nullable = false) // Esto crea la FK en la DB
    private Rol rol;

    @Column(name = "creado", updatable = false)
    private LocalDateTime creado;

    @Column(name = "actualizado")
    private LocalDateTime actualizado;

    // Cuando se crea un nuevo usuario, se establece la fecha de creación al instante actual
    @PrePersist
    protected void onCreate() {
        creado = LocalDateTime.now();
    }

    // Cada vez que se actualiza un usuario, se actualiza la fecha de actualización al instante actual
    @PreUpdate
    protected void onUpdate() {
        actualizado = LocalDateTime.now();
    }

    // Lista de Getters y Setters

    public UUID getId() {
        return usuarioID;
    }

    public void setId(UUID id) {
        this.usuarioID = id;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido1() {
        return apellido1;
    }

    public void setApellido1(String apellido1) {
        this.apellido1 = apellido1;
    }

    public String getApellido2() {
        return apellido2;
    }

    public void setApellido2(String apellido2) {
        this.apellido2 = apellido2;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public LocalDateTime getCreado() {
        return creado;
    }

    public void setCreado(LocalDateTime creado) {
        this.creado = creado;
    }

    public LocalDateTime getActualizado() {
        return actualizado;
    }

    public void setActualizado(LocalDateTime actualizado) {
        this.actualizado = actualizado;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

}

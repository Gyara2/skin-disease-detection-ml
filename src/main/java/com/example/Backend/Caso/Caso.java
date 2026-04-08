package com.example.Backend.Caso;

import com.example.Backend.Diagnostico.Diagnostico;
import com.example.Backend.Usuario.*;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** * Entidad que representa un caso clínico en el sistema.
 * Un caso está asociado a un paciente y a un especialista, y puede tener múltiples diagnósticos.
 */
@Entity
@Table(name = "caso")
public class Caso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_caso")
    private UUID id_caso;

    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialista_id")
    private Usuario especialista;

    @OneToMany(mappedBy = "caso", cascade = CascadeType.ALL)
    private List<Diagnostico> diagnosticos;

    private LocalDateTime creado;
    private LocalDateTime actualizado;

    // Getters, Setters y métodos @PrePersist/@PreUpdate
}

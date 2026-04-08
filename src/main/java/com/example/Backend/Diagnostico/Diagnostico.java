package com.example.Backend.Diagnostico;

import com.example.Backend.Caso.Caso;
import com.example.Backend.Imagen.Imagen;
import com.example.Backend.Prediccion.Prediccion;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/* Entidad que representa un diagnóstico realizado por un especialista para un caso clínico específico.
 * Un diagnóstico está asociado a un caso y a una imagen, y puede tener múltiples predicciones.
 */
@Entity
@Table(name = "diagnostico")
public class Diagnostico {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_diagnostico")
    private UUID id_diagnostico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caso_id")
    private Caso caso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imagen_id")
    private Imagen imagen;

    private String nota;
    private LocalDateTime creado;

    @OneToMany(mappedBy = "diagnostico", cascade = CascadeType.ALL)
    private List<Prediccion> predicciones;

    // Getters y Setters
}

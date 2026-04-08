package com.example.Backend.Prediccion;

import com.example.Backend.Diagnostico.Diagnostico;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prediccion")
public class Prediccion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_prediccion")
    private UUID id_prediccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostico_id")
    private Diagnostico diagnostico;

    @Column(name = "modelo_version")
    private String modeloVersion;

    private String resultado; // Ej: "mel", "bcc", "nv"
    private Float confianza;  // Probabilidad devuelta por el modelo

    private LocalDateTime creado;

    // Getters y Setters
}

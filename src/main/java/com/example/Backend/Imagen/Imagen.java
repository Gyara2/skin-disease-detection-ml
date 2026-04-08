package com.example.Backend.Imagen;


import com.example.Backend.Diagnostico.Diagnostico;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una imagen asociada a un diagnóstico.
 */
@Entity
@Table(name = "imagen")
public class Imagen {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_imagen")
    private UUID id_imagen;

    @Column(name = "storage_key")
    private String storageKey; // Ruta o identificador en el almacenamiento

    private String hash;
    private String mimeType;
    private Long size;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @OneToMany(mappedBy = "imagen")
    private List<Diagnostico> diagnosticos;

    // Getters y Setters
}
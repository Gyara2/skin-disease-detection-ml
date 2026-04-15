package com.example.Backend.Imagen;


import com.example.Backend.Caso.Caso;
import com.example.Backend.Prediccion.Prediccion;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que representa una imagen asociada a un diagnóstico.
 */
@Entity
@Table(name = "imagen")
public class Imagen {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="imagen_id")
    private UUID imagenId;
    private String nombreArchivo;
    @Lob // Esta es la clave para indicarle a JPA que es un objeto grande (BLOB)
    @Column(name = "datos_archivo", columnDefinition = "LONGBLOB") // Forzamos el tipo exacto de MySQL
    private byte[] datosArchivo;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostico_id")
    private Caso caso;

    @OneToOne(mappedBy = "imagen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Prediccion prediccion;


    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Caso getCaso() { return caso; }

    public void setCaso(Caso caso) { this.caso = caso; }

    public UUID getImagenId() {
        return imagenId;
    }

    public void setImagenId(UUID imagenId) {
        this.imagenId = imagenId;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public byte[] getDatosArchivo() {
        return datosArchivo;
    }

    public void setDatosArchivo(byte[] datosArchivo) {
        this.datosArchivo = datosArchivo;
    }

}
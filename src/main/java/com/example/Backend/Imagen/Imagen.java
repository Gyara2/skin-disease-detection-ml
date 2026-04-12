package com.example.Backend.Imagen;


import com.example.Backend.Diagnostico.Diagnostico;
import jakarta.persistence.*;

import java.sql.Blob;
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
    @Column(name="imagen_id")
    private UUID imagenId;

    private String nombreArchivo;

    @Lob // Esta es la clave para indicarle a JPA que es un objeto grande (BLOB)
    @Column(name = "datos_archivo", columnDefinition = "LONGBLOB") // Forzamos el tipo exacto de MySQL
    private byte[] datosArchivo;
    @Column(name = "storage_key")
    private String storageKey;

    private String hash;
    private String mimeType;
    private Long size;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostico_id")
    private Diagnostico diagnostico;

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Diagnostico getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(Diagnostico diagnostico) {
        this.diagnostico = diagnostico;
    }

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
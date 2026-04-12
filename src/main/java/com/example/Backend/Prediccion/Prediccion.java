package com.example.Backend.Prediccion;

import com.example.Backend.Diagnostico.Diagnostico;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que representa una Predicción realizada por el modelo de IA.
 * Cada Predicción está asociada a un Diagnóstico específico y contiene información
 * sobre el resultado de la predicción, la versión del modelo utilizado y la confianza.
 */
@Entity
@Table(name = "prediccion")
public class Prediccion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="prediccion_id")
    private UUID prediccionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostico_id")
    private Diagnostico diagnostico;

    @Column(name = "modelo_version")
    private String modeloVersion;

    private String resultado; // Ej: "mel", "bcc", "nv"
    private Float confianza;  // Probabilidad devuelta por el modelo

    private LocalDateTime creado;

    public UUID getPrediccionId() {
        return prediccionId;
    }

    public void setPrediccionId(UUID prediccionId) {
        this.prediccionId = prediccionId;
    }

    public Diagnostico getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(Diagnostico diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getModeloVersion() {
        return modeloVersion;
    }

    public void setModeloVersion(String modeloVersion) {
        this.modeloVersion = modeloVersion;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public Float getConfianza() {
        return confianza;
    }

    public void setConfianza(Float confianza) {
        this.confianza = confianza;
    }

    public LocalDateTime getCreado() {
        return creado;
    }

    public void setCreado(LocalDateTime creado) {
        this.creado = creado;
    }
}

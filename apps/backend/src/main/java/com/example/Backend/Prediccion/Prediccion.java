package com.example.Backend.Prediccion;

import com.example.Backend.Imagen.Imagen;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;

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
    @JoinColumn(name = "imagen_id")
    private Imagen imagen;

    @Column(name = "modelo_version")
    private String modeloVersion;

    @Column(columnDefinition = "json")
    // Esta anotación de abajo es la que le dice a Hibernate que lo gestione como JSON automáticamente
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private Map<String, Double> resultado;

    private LocalDateTime creado;

    public UUID getPrediccionId() {
        return prediccionId;
    }

    public void setPrediccionId(UUID prediccionId) {
        this.prediccionId = prediccionId;
    }


    public String getModeloVersion() {
        return modeloVersion;
    }

    public void setModeloVersion(String modeloVersion) {
        this.modeloVersion = modeloVersion;
    }

    public Imagen getImagen() { return imagen; }

    public void setImagen(Imagen imagen) { this.imagen = imagen; }

    public Map<String, Double> getResultado() { return resultado; }

    public void setResultado(Map<String, Double> resultado) { this.resultado = resultado; }

    public LocalDateTime getCreado() {
        return creado;
    }

    public void setCreado(LocalDateTime creado) {
        this.creado = creado;
    }
}

package com.example.Backend.Diagnostico;

import com.example.Backend.Caso.Caso;
import com.example.Backend.Imagen.Imagen;
import com.example.Backend.Prediccion.Prediccion;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    @Column(name="diagnostico_id")
    private UUID diagnosticoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caso_id")
    private Caso caso;

    @OneToMany(mappedBy = "diagnostico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Imagen> imagenes = new ArrayList<>();

    private String nota;
    private LocalDateTime creado;

    @OneToOne(mappedBy = "diagnostico", cascade = CascadeType.ALL)
    private Prediccion prediccion;

    public UUID getDiagnosticoId() {
        return diagnosticoId;
    }

    public void setDiagnosticoId(UUID diagnosticoId) {
        this.diagnosticoId = diagnosticoId;
    }

    public Caso getCaso() {
        return caso;
    }

    public void setCaso(Caso caso) {
        this.caso = caso;
    }

    public List<Imagen> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<Imagen> imagenes) {
        this.imagenes = imagenes;
    }

    public String getNota() {
        return nota;
    }

    public void setNota(String nota) {
        this.nota = nota;
    }

    public LocalDateTime getCreado() {
        return creado;
    }

    public void setCreado(LocalDateTime creado) {
        this.creado = creado;
    }

    public Prediccion getPrediccion() {
        return prediccion;
    }

    public void setPrediccion(Prediccion predicciones) {
        this.prediccion = predicciones;
    }
}

package com.example.Backend.Caso;

import com.example.Backend.Imagen.Imagen;
import com.example.Backend.Usuario.*;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** * Entidad que representa un caso clínico en el sistema.
 * Un caso está asociado a un paciente y a un especialista, y puede tener múltiples diagnósticos.
 */
@Entity
@Table(name = "caso")
public class Caso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="caso_id")
    private Long casoId;

    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialista_id")
    private Usuario especialista;

    @OneToMany(mappedBy = "caso", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Imagen> imagenes = new ArrayList<>();

    @Column(name = "diagnostico_especialista", columnDefinition = "TEXT")
    private String diagnosticoEspecialista;

    @Column(name = "nota_especialista", columnDefinition = "TEXT")
    private String notaEspecialista;

    @Column(name = "diagnostico_creado")
    private LocalDateTime diagnosticoCreado;

    @Column(name = "diagnostico_actualizado")
    private LocalDateTime diagnosticoActualizado;

    private LocalDateTime creado;
    private LocalDateTime actualizado;

    public Long getIdCaso() {
        return casoId;
    }

    public void setIdCaso(Long idCaso) {
        this.casoId = idCaso;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Usuario getPaciente() {
        return paciente;
    }

    public void setPaciente(Usuario paciente) {
        this.paciente = paciente;
    }

    public Usuario getEspecialista() {
        return especialista;
    }

    public void setEspecialista(Usuario especialista) {
        this.especialista = especialista;
    }

    public List<Imagen> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<Imagen> imagenes) {
        this.imagenes = imagenes;
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

    public String getDiagnosticoEspecialista() {
        return diagnosticoEspecialista;
    }

    public void setDiagnosticoEspecialista(String diagnosticoEspecialista) {
        this.diagnosticoEspecialista = diagnosticoEspecialista;
    }

    public String getNotaEspecialista() {
        return notaEspecialista;
    }

    public void setNotaEspecialista(String notaEspecialista) {
        this.notaEspecialista = notaEspecialista;
    }

    public LocalDateTime getDiagnosticoCreado() {
        return diagnosticoCreado;
    }

    public void setDiagnosticoCreado(LocalDateTime diagnosticoCreado) {
        this.diagnosticoCreado = diagnosticoCreado;
    }

    public LocalDateTime getDiagnosticoActualizado() {
        return diagnosticoActualizado;
    }

    public void setDiagnosticoActualizado(LocalDateTime diagnosticoActualizado) {
        this.diagnosticoActualizado = diagnosticoActualizado;
    }

    public void addImagen(Imagen imagen) {
        imagen.setCaso(this);
        imagenes.add(imagen);
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        creado = now;
        actualizado = now;
    }

    @PreUpdate
    public void onUpdate() {
        actualizado = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Caso{" +
                "casoId=" + casoId +
                ", estado='" + estado + '\'' +
                ", paciente=" + paciente +
                ", especialista=" + especialista +
                ", imagenes=" + imagenes +
                ", diagnosticoEspecialista='" + diagnosticoEspecialista + '\'' +
                ", notaEspecialista='" + notaEspecialista + '\'' +
                ", diagnosticoCreado=" + diagnosticoCreado +
                ", diagnosticoActualizado=" + diagnosticoActualizado +
                ", creado=" + creado +
                ", actualizado=" + actualizado +
                '}';
    }
}

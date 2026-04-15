package com.example.Backend.Caso;

import com.example.Backend.Imagen.Imagen;
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

    @OneToMany(mappedBy = "caso", cascade = CascadeType.ALL)
    private List<Imagen> imagenes;

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

    @Override
    public String toString() {
        return "Caso{" +
                "casoId=" + casoId +
                ", estado='" + estado + '\'' +
                ", paciente=" + paciente +
                ", especialista=" + especialista +
                ", imagenes=" + imagenes +
                ", creado=" + creado +
                ", actualizado=" + actualizado +
                '}';
    }
}

package com.example.Backend.Validacion;

import com.example.Backend.Prediccion.Prediccion;
import com.example.Backend.Usuario.Usuario;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/** Entidad que representa la validación de una predicción por parte de un especialista.
 * Contiene información sobre el resultado final, notas del especialista y la fecha de creación.
 */
@Entity
@Table(name = "validacion")
public class Validacion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id_usuario")
    private UUID id_usuario;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediccion_id")
    private Prediccion prediccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialista_id")
    private Usuario especialista;

    @Column(name = "resultado_final")
    private String resultadoFinal;

    private String nota;
    private LocalDateTime creado;

    // Getters y Setters
}

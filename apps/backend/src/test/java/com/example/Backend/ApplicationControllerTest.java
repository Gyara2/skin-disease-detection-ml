package com.example.Backend;

import com.example.Backend.Caso.CasoService;
import com.example.Backend.DTO.CasoDetalleResponse;
import com.example.Backend.DTO.CasoDetalleUsuarioResponse;
import com.example.Backend.DTO.CasoDiagnosticoRequest;
import com.example.Backend.DTO.CasoListItemResponse;
import com.example.Backend.DTO.CasoUpsertRequest;
import com.example.Backend.DTO.UsuarioCreateRequest;
import com.example.Backend.DTO.UsuarioResponse;
import com.example.Backend.DTO.UsuarioRolUpdateRequest;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Rol.RolService;
import com.example.Backend.Security.JwtUtil;
import com.example.Backend.Usuario.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioService usuarioService;

    @MockBean
    private RolService rolService;

    @MockBean
    private CasoService casoService;

    @MockBean
    private JwtUtil jwtUtil;
    @Test
    void shouldCreateCasoWhenIdIsNull() throws Exception {
        CasoDetalleResponse response = buildCasoDetalleResponse("15");
        when(casoService.upsertCaso(any(CasoUpsertRequest.class))).thenReturn(response);

        Map<String, Object> payload = Map.of(
                "id", null,
                "paciente", "4",
                "especialista", "2",
                "imagenes", List.of("dGVzdA==")
        );

        mockMvc.perform(post("/api/casos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("15"))
                .andExpect(jsonPath("$.paciente.id").value("4"))
                .andExpect(jsonPath("$.especialista.id").value("2"));
    }

    @Test
    void shouldUpdateCasoWhenIdExists() throws Exception {
        CasoDetalleResponse response = buildCasoDetalleResponse("15");
        when(casoService.upsertCaso(any(CasoUpsertRequest.class))).thenReturn(response);

        Map<String, Object> payload = Map.of(
                "id", "15",
                "paciente", "4",
                "especialista", "2",
                "imagenes", List.of("dGVzdA==")
        );

        mockMvc.perform(post("/api/casos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("15"));
    }

    @Test
    void shouldGetCasosByActor() throws Exception {
        when(casoService.getCasosForActor(eq("laura.lopez@skindiseaseml.local"), eq("ESPECIALISTA")))
                .thenReturn(List.of(
                        new CasoListItemResponse(
                                "15",
                                "4",
                                "Ana Garcia Sanz",
                                "2",
                                "Laura Lopez Martin",
                                "pendiente",
                                1,
                                1,
                                LocalDateTime.now(),
                                LocalDateTime.now()
                        )
                ));

        mockMvc.perform(get("/api/casos")
                        .param("actorEmail", "laura.lopez@skindiseaseml.local")
                        .param("actorRol", "ESPECIALISTA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("15"))
                .andExpect(jsonPath("$[0].especialista_id").value("2"));
    }

    @Test
    void shouldCreateUsuario() throws Exception {
        UsuarioResponse response = new UsuarioResponse(
                "7",
                "20000007K",
                "Ana",
                "Garcia",
                "Sanz",
                "ana.garcia@skindiseaseml.local",
                Rol.TipoRol.PACIENTE,
                "rol-paciente",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(usuarioService.crearUsuario(any(UsuarioCreateRequest.class))).thenReturn(response);

        Map<String, Object> payload = Map.of(
                "dni", "20000007K",
                "nombre", "Ana",
                "apellido1", "Garcia",
                "apellido2", "Sanz",
                "email", "ana.garcia@skindiseaseml.local",
                "rol", "PACIENTE"
        );

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("7"))
                .andExpect(jsonPath("$.rol").value("PACIENTE"));
    }

    @Test
    void shouldPatchCasoDiagnostico() throws Exception {
        CasoDetalleResponse response = buildCasoDetalleResponse("15");
        when(casoService.registrarDiagnostico(eq(15L), any(CasoDiagnosticoRequest.class))).thenReturn(response);

        Map<String, Object> payload = Map.of(
                "especialistaId", "2",
                "diagnostico", "Queratosis seborreica",
                "nota", "Compatible con clínica."
        );

        mockMvc.perform(patch("/api/casos/15/diagnostico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("15"));
    }

    @Test
    void shouldPatchUsuarioRol() throws Exception {
        UsuarioResponse response = new UsuarioResponse(
                "7",
                "20000007K",
                "Ana",
                "Garcia",
                "Sanz",
                "ana.garcia@skindiseaseml.local",
                Rol.TipoRol.ESPECIALISTA,
                "rol-especialista",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(usuarioService.actualizarRol(eq(7L), any(UsuarioRolUpdateRequest.class))).thenReturn(response);

        Map<String, Object> payload = Map.of("rol", "ESPECIALISTA");

        mockMvc.perform(patch("/api/usuarios/7/rol")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("7"))
                .andExpect(jsonPath("$.rol").value("ESPECIALISTA"));
    }

    private CasoDetalleResponse buildCasoDetalleResponse(String id) {
        return new CasoDetalleResponse(
                id,
                "pendiente",
                LocalDateTime.now(),
                LocalDateTime.now(),
                new CasoDetalleUsuarioResponse("4", "Ana", "Garcia", "Sanz"),
                new CasoDetalleUsuarioResponse("2", "Laura", "Lopez", "Martin"),
                null,
                List.of()
        );
    }
}

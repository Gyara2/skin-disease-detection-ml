package com.example.Backend;

import com.example.Backend.Caso.CasoService;
import com.example.Backend.DTO.CasoDetalleResponse;
import com.example.Backend.DTO.CasoDiagnosticoRequest;
import com.example.Backend.DTO.CasoListItemResponse;
import com.example.Backend.DTO.CasoUpsertRequest;
import com.example.Backend.DTO.LoginRequest;
import com.example.Backend.DTO.LoginResponse;
import com.example.Backend.DTO.NewCasoRequest;
import com.example.Backend.DTO.NewUserRequest;
import com.example.Backend.DTO.UsuarioCreateRequest;
import com.example.Backend.DTO.UsuarioResponse;
import com.example.Backend.DTO.UsuarioRolUpdateRequest;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Rol.RolService;
import com.example.Backend.Security.JwtUtil;
import com.example.Backend.Usuario.Usuario;
import com.example.Backend.Usuario.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://frontend:5173"
})
public class ApplicationController {

    private final UsuarioService usuarioService;
    private final RolService rolService;
    private final CasoService casoService;
    private final PasswordEncoder encoder ;

    public ApplicationController(
            UsuarioService usuarioService,
            RolService rolService,
            CasoService casoService,
            PasswordEncoder encoder
    ) {
        this.usuarioService = usuarioService;
        this.rolService = rolService;
        this.casoService = casoService;
        this.encoder = encoder;
    }

    @GetMapping("/usuarios")
    public ResponseEntity<?> getUsuarios() {
        try {
            return ResponseEntity.ok(usuarioService.getAllUsuarios());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los usuarios: " + e.getMessage());
        }
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioCreateRequest request) {
        try {
            UsuarioResponse usuario = usuarioService.crearUsuario(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear el usuario: " + e.getMessage());
        }
    }

    @PatchMapping("/usuarios/{id}/rol")
    public ResponseEntity<?> actualizarRolUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioRolUpdateRequest request
    ) {
        try {
            UsuarioResponse usuario = usuarioService.actualizarRol(id, request);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar el rol: " + e.getMessage());
        }
    }

    @GetMapping("/casos")
    public ResponseEntity<?> getCasos(
            @RequestParam String actorEmail,
            @RequestParam String actorRol
    ) {
        try {
            List<CasoListItemResponse> casos = casoService.getCasosForActor(actorEmail, actorRol);
            return ResponseEntity.ok(casos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los casos: " + e.getMessage());
        }
    }

    @GetMapping("/casos/{id}")
    public ResponseEntity<?> getCasoDetalle(
            @PathVariable Long id,
            @RequestParam(required = false) String actorEmail,
            @RequestParam(required = false) String actorRol
    ) {
        try {
            CasoDetalleResponse caso = (
                    actorEmail != null && !actorEmail.isBlank() && actorRol != null && !actorRol.isBlank()
                            ? casoService.getCasoDetalle(id, actorEmail, actorRol)
                            : casoService.getCasoDetalle(id)
            );
            return ResponseEntity.ok(caso);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener el caso: " + e.getMessage());
        }
    }

    @PostMapping("/casos")
    public ResponseEntity<?> upsertCaso(@RequestBody CasoUpsertRequest request) {
        try {
            CasoDetalleResponse caso = casoService.upsertCaso(request);
            return ResponseEntity.ok(caso);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar el caso: " + e.getMessage());
        }
    }

    @PatchMapping("/casos/{id}/diagnostico")
    public ResponseEntity<?> registrarDiagnosticoCaso(
            @PathVariable Long id,
            @RequestBody CasoDiagnosticoRequest request
    ) {
        try {
            CasoDetalleResponse caso = casoService.registrarDiagnostico(id, request);
            return ResponseEntity.ok(caso);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar el diagnóstico del especialista: " + e.getMessage());
        }
    }

    @PostMapping("/NewUser")
    public ResponseEntity<String> newUser(@RequestBody NewUserRequest request) {
        try {
            if (request == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La solicitud no puede estar vacía.");
            }
            Rol rol = rolService.findByNombre(request.rol() == null ? "" : request.rol().toUpperCase());
            if (rol == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Rol no válido: " + request.rol());
            }

            Usuario usuario = new Usuario();
            usuario.setDni(request.dni());
            usuario.setNombre(request.nombre());
            usuario.setApellido1(request.apellido1());
            usuario.setApellido2(request.apellido2() == null ? "" : request.apellido2());
            usuario.setEmail(request.email());
            usuario.setEdad(request.edad() == null ? 0 : request.edad());
            usuario.setPassword(encoder.encode(request.password() == null || request.password().isBlank()
                    ? "Temporal123!"
                    : request.password()));
            usuario.setRol(rol);

            usuarioService.newUsuario(usuario);
            return ResponseEntity.ok("Usuario creado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear el usuario: " + e.getMessage());
        }
    }

    @PostMapping("/LogIn")
    public ResponseEntity<?> logIn(@RequestBody LoginRequest request) {
        try {
            if (request == null || request.email() == null || request.password() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("El correo y la contraseña son obligatorios.");
            }
            
            Usuario usuario = usuarioService.findByEmail(request.email().trim().toLowerCase());
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado con el correo: " + request.email());
            }
            if (!encoder.matches(request.password(), usuario.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Contraseña incorrecta.");
            }
            String token = getToken(usuario);
            
            LoginResponse response = new LoginResponse(
                    token,
                    usuario.getEmail(),
                    usuario.getNombre(),
                    usuario.getApellido1(),
                    usuario.getApellido2(),
                    usuario.getRol().getNombre().toString(),
                    usuario.getRol().getId().toString(),
                    usuario.getId()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error de autenticación: " + e.getMessage());
        }
    }

    @PostMapping("/NewCaso")
    public ResponseEntity<String> newCase(@ModelAttribute NewCasoRequest request) {
        try {
            if (request == null || request.imagenes() == null || request.imagenes().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No se proporcionaron imágenes para el caso clínico.");
            }

            Usuario paciente = usuarioService.findByEmail(request.emailPaciente());
            Usuario especialista = usuarioService.findByEmail(request.emailEspecialista());
            if (paciente == null || especialista == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No se encontró paciente o especialista con los correos indicados.");
            }

            List<String> imagenesBase64 = request.imagenes().stream()
                    .map(this::toRawBase64)
                    .toList();

            casoService.upsertCaso(new CasoUpsertRequest(
                    null,
                    String.valueOf(paciente.getId()),
                    String.valueOf(especialista.getId()),
                    imagenesBase64
            ));

            return ResponseEntity.ok("Caso clínico creado/actualizado correctamente.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar el caso: " + e.getMessage());
        }
    }

    @GetMapping("/GetCasoFromPaciente")
    public ResponseEntity<?> getCaseFromPaciente(@RequestParam String correo) {
        try {
            return ResponseEntity.ok(casoService.getCasosForActor(correo, "PACIENTE"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener casos por paciente: " + e.getMessage());
        }
    }

    @GetMapping("/GetCasoFromEspecialista")
    public ResponseEntity<?> getCaseFromEspecialista(@RequestParam String correo) {
        try {
            return ResponseEntity.ok(casoService.getCasosForActor(correo, "ESPECIALISTA"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener casos por especialista: " + e.getMessage());
        }
    }

    @GetMapping("/Roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            Map<String, Long> roles = rolService.getAllRoles();
            if (roles == null || roles.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontraron roles en la base de datos.");
            }
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los roles: " + e.getMessage());
        }
    }

    @GetMapping("/ListadoUsuarios")
    public ResponseEntity<?> getAllUsuarios() {
        try {
            return ResponseEntity.ok(usuarioService.getAllUsuarios());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los usuarios: " + e.getMessage());
        }
    }

    public String getToken(Usuario user) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("rol", user.getRol().getNombre());
            return JwtUtil.generateToken(claims, user.getEmail());
        } catch (Exception e) {
            return null;
        }
    }

    private String toRawBase64(MultipartFile file) {
        try {
            return Base64.getEncoder().encodeToString(file.getBytes());
        } catch (Exception e) {
            throw new IllegalArgumentException("No se pudo convertir la imagen: " + file.getOriginalFilename());
        }
    }
}

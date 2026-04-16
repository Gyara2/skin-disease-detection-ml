package com.example.Backend.Usuario;

import com.example.Backend.DTO.UsuarioCreateRequest;
import com.example.Backend.DTO.UsuarioResponse;
import com.example.Backend.DTO.UsuarioRolUpdateRequest;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Rol.RolService;
import com.example.Backend.Security.SecurityConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RolService rolService;

    private static final String TEMPORARY_PASSWORD = "Temporal123!";

    public List<UsuarioResponse> getAllUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Usuario::getId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Usuario newUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No existe usuario con id " + id));
    }

    public UsuarioResponse crearUsuario(UsuarioCreateRequest request) {
        validarCreateRequest(request);

        if (usuarioRepository.existsByEmail(request.email().trim().toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Ya existe un usuario con el email indicado.");
        }

        if (usuarioRepository.existsByDni(request.dni().trim().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Ya existe un usuario con el DNI indicado.");
        }

        Rol rol = rolService.findByNombre(request.rol().trim().toUpperCase(Locale.ROOT));
        if (rol == null) {
            throw new IllegalArgumentException("Rol no válido: " + request.rol());
        }

        Usuario usuario = new Usuario();
        usuario.setDni(request.dni().trim().toUpperCase(Locale.ROOT));
        usuario.setNombre(request.nombre().trim());
        usuario.setApellido1(request.apellido1().trim());
        usuario.setApellido2(request.apellido2() == null ? "" : request.apellido2().trim());
        usuario.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        usuario.setEdad(0);
        usuario.setPassword(SecurityConfig.passwordEncoder().encode(TEMPORARY_PASSWORD));
        usuario.setRol(rol);

        return toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse actualizarRol(Long usuarioId, UsuarioRolUpdateRequest request) {
        if (request == null || request.rol() == null || request.rol().trim().isEmpty()) {
            throw new IllegalArgumentException("El rol es obligatorio.");
        }

        Usuario usuario = findById(usuarioId);
        Rol rol = rolService.findByNombre(request.rol().trim().toUpperCase(Locale.ROOT));
        if (rol == null) {
            throw new IllegalArgumentException("Rol no válido: " + request.rol());
        }

        usuario.setRol(rol);
        return toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                String.valueOf(usuario.getId()),
                usuario.getDni(),
                usuario.getNombre(),
                usuario.getApellido1(),
                usuario.getApellido2(),
                usuario.getEmail(),
                usuario.getRol().getNombre(),
                toRolId(usuario.getRol().getNombre()),
                usuario.getCreado(),
                usuario.getActualizado()
        );
    }

    private String toRolId(Rol.TipoRol rol) {
        return switch (rol) {
            case ADMIN -> "rol-admin";
            case ESPECIALISTA -> "rol-especialista";
            case PACIENTE -> "rol-paciente";
        };
    }

    private void validarCreateRequest(UsuarioCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("La solicitud de alta de usuario es obligatoria.");
        }
        if (request.dni() == null || request.dni().trim().isEmpty()) {
            throw new IllegalArgumentException("El DNI es obligatorio.");
        }
        if (request.nombre() == null || request.nombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }
        if (request.apellido1() == null || request.apellido1().trim().isEmpty()) {
            throw new IllegalArgumentException("El primer apellido es obligatorio.");
        }
        if (request.email() == null || request.email().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es obligatorio.");
        }
        if (request.rol() == null || request.rol().trim().isEmpty()) {
            throw new IllegalArgumentException("El rol es obligatorio.");
        }
    }
}

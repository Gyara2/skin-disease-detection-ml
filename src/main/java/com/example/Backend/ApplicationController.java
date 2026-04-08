package com.example.Backend;

import com.example.Backend.DTO.NewUserRequest;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Rol.RolService;
import com.example.Backend.Security.JwtUtil;
import com.example.Backend.Security.SecurityConfig;
import com.example.Backend.Usuario.Usuario;
import com.example.Backend.Usuario.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para manejar las solicitudes relacionadas con los usuarios.
 * Proporciona endpoints para crear nuevos usuarios y para iniciar sesión.
 */
@RestController
@RequestMapping("/api")
public class ApplicationController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolService rolService;

    private final BCryptPasswordEncoder encoder = SecurityConfig.passwordEncoder();

    /**
     * Endpoint para crear un nuevo usuario.
     *
     * @param usuariodto Objeto que contiene los datos del nuevo usuario.
     * @return ResponseEntity con el resultado de la operación.
     */
    @PostMapping("/NewUser")
    public ResponseEntity<String> newUser(@RequestBody NewUserRequest usuariodto) {
        Usuario usuario = new Usuario();

        usuario.setDni(usuariodto.getDni());
        usuario.setNombre(usuariodto.getNombre());
        usuario.setApellido1(usuariodto.getApellido1());
        usuario.setApellido2(usuariodto.getApellido2());
        usuario.setEmail(usuariodto.getEmail());
        usuario.setPassword(encoder.encode(usuariodto.getPassword()));

        // Asignar el rol al usuario
        Rol rol = rolService.findByNombre(usuariodto.getRol().toUpperCase());
        if (rol == null) {
            return ResponseEntity.status(400).body("Rol no válido: " + usuariodto.getRol());
        }

        usuario.setRol(rol);
        usuario.setCreado(java.time.LocalDateTime.now());
        usuario.setActualizado(java.time.LocalDateTime.now());

        try {
            usuarioService.newUsuario(usuario);
            return ResponseEntity.ok("Usuario creado correctamente");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al crear el usuario: " + e.getMessage());
        }
    }

    @GetMapping("/LogIn")
    public ResponseEntity<String> logIn(@RequestParam String email, @RequestParam String password) {
        try{
                Usuario usuario = usuarioService.findByEmail(email);
                if (usuario == null) {
                    return ResponseEntity.status(404).body("Usuario no encontrado con el correo: " + email);
                }else{
                    if (!encoder.matches(password, usuario.getPassword())) {
                        return ResponseEntity.status(401).body("Contraseña incorrecta para el correo: " + email);
                    }
                }
            String token = getToken(usuario);
            return ResponseEntity.ok("Inicio de sesión exitoso para el usuario con correo: " + email + ". Token: " + token);
        }catch(Exception e){
            return ResponseEntity.status(401).body("Error de autenticación: " + e.getMessage());
        }
    }

    public String getToken(Usuario user){
       try{
           Map<String, Object> claims = new HashMap<>();

           // Aqui guardamos la informacion que guardamos en el token
           claims.put("rol", user.getRol().getNombre());
           return JwtUtil.generateToken(claims, user.getEmail());
       }catch(Exception e){
           System.out.println("Error al generar el token: " + e.getMessage());
           return null;
       }
    }

    @PostMapping("/NewCaso")
    public ResponseEntity<String> newCase() {
        // REQUISITOS
        // El usuario en uso debe ser un ESPECIALISTA --> Recoger su info
        // Asignar un usuario PACIENTE al caso clínico --> Recoger su info
        // Guardar las imagenes en la BBDD y asignarlas al caso

        return ResponseEntity.ok("Endpoint para crear un nuevo caso clínico");
    }
}

package com.example.Backend.Usuario;

import com.example.Backend.DTO.UsuarioResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/** Servicio para la entidad Usuario, que proporciona métodos para crear un nuevo usuario
 *  y encontrar un usuario por su email.
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<UsuarioResponse> getAllUsuarios() {
        return usuarioRepository.findAllUsuarios();
    }
    public Usuario newUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}

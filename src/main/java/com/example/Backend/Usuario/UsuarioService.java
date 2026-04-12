package com.example.Backend.Usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** Servicio para la entidad Usuario, que proporciona métodos para crear un nuevo usuario
 *  y encontrar un usuario por su email.
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario newUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}

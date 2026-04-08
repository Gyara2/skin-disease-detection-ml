package com.example.Backend.Rol;

import com.example.Backend.Usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public Rol findByNombre(String nombre) {

        return rolRepository.findByNombre(Rol.TipoRol.valueOf(nombre));
    }
}

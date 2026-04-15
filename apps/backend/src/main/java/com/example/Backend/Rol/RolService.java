package com.example.Backend.Rol;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public Rol findByNombre(String nombre) {

        return rolRepository.findByNombre(Rol.TipoRol.valueOf(nombre));
    }

    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }
}

package com.example.Backend.Rol;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public Rol findByNombre(String nombre) {

        return rolRepository.findByNombre(Rol.TipoRol.valueOf(nombre));
    }

    public Map<String, Long> getAllRoles() {
        List<Rol> roles = rolRepository.findAll();
        Map<String, Long> rolesMap = roles.stream()
                .collect(Collectors.toMap(
                        rol -> rol.getNombre().name(), // Convertir el enum a String
                        Rol::getId
                ));
        return rolesMap;
    }
}

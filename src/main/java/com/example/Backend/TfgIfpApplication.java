package com.example.Backend;

import ch.qos.logback.core.net.SyslogOutputStream;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Rol.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TfgIfpApplication {

    public static void main(String[] args) {

        SpringApplication.run(TfgIfpApplication.class, args);
    }

    /**
     * Este método se ejecutará al iniciar la aplicación y se encargará de crear los roles en la base de datos
     * si no existen. Recorre todos los valores del Enum TipoRol y verifica si cada uno ya existe en la base de datos.
     * Si no existe, lo crea y lo guarda.
     */
    @Bean
    CommandLineRunner init(RolRepository rolRepository) {
        return args -> {
            try{
                // Recorremos todos los valores de nuestro Enum
                for (Rol.TipoRol tipo : Rol.TipoRol.values()) {
                    // Si el rol no existe por nombre, lo creamos
                    if (!rolRepository.existsByNombre(tipo)) {
                        Rol nuevoRol = new Rol();
                        nuevoRol.setNombre(tipo);
                        rolRepository.save(nuevoRol);
                        System.out.println("Rol creado: " + tipo);
                    }else{
                        System.out.println("Rol ya existe: " + tipo);
                    }
                }
            }catch(Exception e){
                System.out.println("Error al inicializar los roles: " + e.getMessage());
            }
        };
    }

}

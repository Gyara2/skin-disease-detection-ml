package com.example.Backend;

import ch.qos.logback.core.net.SyslogOutputStream;
import com.example.Backend.Rol.Rol;
import com.example.Backend.Rol.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;

import java.awt.*;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class TfgIfpApplication {
    public static void main(String[] args) {
        SpringApplication.run(TfgIfpApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void abrirNavegador() {
        String url = "http://localhost:8080";
        if (Desktop.isDesktopSupported()) {
            Desktop desktop = Desktop.getDesktop();
            try {
                desktop.browse(new URI(url));
            } catch (IOException | URISyntaxException e) {
                e.printStackTrace();
            }
        }
    }



}

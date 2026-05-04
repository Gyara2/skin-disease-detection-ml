-- Roles base
INSERT INTO rol (rolId, nombre) VALUES (1, 'ADMIN')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
INSERT INTO rol (rolId, nombre) VALUES (2, 'ESPECIALISTA')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
INSERT INTO rol (rolId, nombre) VALUES (3, 'PACIENTE')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Password inicial comun (BCrypt): password
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO usuario (usuarioId, dni, nombre, apellido1, apellido2, edad, email, password, rol_id, creado, actualizado)
VALUES
    (1, '00000000A', 'Administrador', 'Sistema', '', 35, 'admin@skindiseaseml.local', '$2a$10$VgdN8zu.2uLneKsD7eRMLOj2oK8IZ/g4H/Jhcod8kouBbj//Juugu', 1, NOW(), NOW()),
    (2, '10000001B', 'Laura', 'Lopez', 'Martin', 33, 'laura.lopez@skindiseaseml.local', '$2a$10$VgdN8zu.2uLneKsD7eRMLOj2oK8IZ/g4H/Jhcod8kouBbj//Juugu', 2, NOW(), NOW()),
    (3, '10000002C', 'Carlos', 'Ruiz', 'Santos', 40, 'carlos.ruiz@skindiseaseml.local', '$2a$10$VgdN8zu.2uLneKsD7eRMLOj2oK8IZ/g4H/Jhcod8kouBbj//Juugu', 2, NOW(), NOW()),
    (4, '20000001D', 'Ana', 'Garcia', 'Sanz', 29, 'ana.garcia@skindiseaseml.local', '$2a$10$VgdN8zu.2uLneKsD7eRMLOj2oK8IZ/g4H/Jhcod8kouBbj//Juugu', 3, NOW(), NOW()),
    (5, '20000002E', 'Mario', 'Perez', 'Lozano', 46, 'mario.perez@skindiseaseml.local', '$2a$10$VgdN8zu.2uLneKsD7eRMLOj2oK8IZ/g4H/Jhcod8kouBbj//Juugu', 3, NOW(), NOW()),
    (6, '20000003F', 'Elena', 'Torres', 'Diaz', 52, 'elena.torres@skindiseaseml.local', '$2a$10$VgdN8zu.2uLneKsD7eRMLOj2oK8IZ/g4H/Jhcod8kouBbj//Juugu', 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    dni = VALUES(dni),
    nombre = VALUES(nombre),
    apellido1 = VALUES(apellido1),
    apellido2 = VALUES(apellido2),
    edad = VALUES(edad),
    email = VALUES(email),
    password = VALUES(password),
    rol_id = VALUES(rol_id),
    actualizado = NOW();
